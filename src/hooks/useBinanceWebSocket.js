import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for Binance WebSocket price streaming
 * Provides real-time cryptocurrency prices with automatic reconnection
 * 
 * @param {string[]} symbols - Array of trading pairs to subscribe to (e.g., ['BTCUSDT', 'ETHUSDT'])
 * @returns {Object} - { prices, isConnected, error }
 */
export default function useBinanceWebSocket(symbols = []) {
    const [prices, setPrices] = useState({})
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState(null)

    const wsRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)
    const reconnectAttemptsRef = useRef(0)
    const maxReconnectAttempts = 10
    const baseReconnectDelay = 1000 // 1 second

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return // Already connected
        }

        try {
            // Determine WebSocket URL based on environment
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
            if (apiBaseUrl === 'your_key_here' || !apiBaseUrl.startsWith('http')) {
                apiBaseUrl = 'http://localhost:8000'
            }
            const wsHost = apiBaseUrl.replace('http://', '').replace('https://', '')
            const wsUrl = `${wsProtocol}//${wsHost}/ws/prices`

            console.log('Connecting to WebSocket:', wsUrl)
            const ws = new WebSocket(wsUrl)

            const pendingUpdates = {}
            let flushInterval = null

            ws.onopen = () => {
                console.log('✅ WebSocket connected')
                setIsConnected(true)
                setError(null)
                reconnectAttemptsRef.current = 0

                // Send ping to keep connection alive
                const pingInterval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }))
                    }
                }, 30000) // Ping every 30 seconds

                ws.pingInterval = pingInterval

                // Flush pending updates every 500ms to throttle re-renders
                ws.flushInterval = setInterval(() => {
                    const updates = Object.keys(pendingUpdates)
                    if (updates.length > 0) {
                        setPrices(prev => {
                            const newPrices = { ...prev }
                            updates.forEach(symbol => {
                                newPrices[symbol] = pendingUpdates[symbol]
                            })
                            return newPrices
                        })
                        // Clear pending updates
                        updates.forEach(s => delete pendingUpdates[s])
                    }
                }, 500)
            }

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)

                    if (message.type === 'price_update') {
                        const { symbol, data, history } = message

                        // Store in pending updates buffer
                        pendingUpdates[symbol] = {
                            current_price: data.price,
                            percent_change: data.percent_change,
                            high_24h: data.high_24h,
                            low_24h: data.low_24h,
                            volume_24h: data.volume_24h,
                            last_update: data.last_update,
                            history: history.map(h => ({
                                time: new Date(h.time).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }),
                                price: h.price
                            }))
                        }
                    }
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err)
                }
            }

            ws.onerror = (err) => {
                console.error('WebSocket error:', err)
                setError('WebSocket connection error')
            }

            ws.onclose = () => {
                console.log('WebSocket disconnected')
                setIsConnected(false)

                // Clear ping interval
                if (ws.pingInterval) {
                    clearInterval(ws.pingInterval)
                }
                if (ws.flushInterval) {
                    clearInterval(ws.flushInterval)
                }

                // Attempt reconnection with exponential backoff
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current)
                    console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`)

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current += 1
                        connect()
                    }, delay)
                } else {
                    setError('Failed to connect after multiple attempts')
                }
            }

            wsRef.current = ws

        } catch (err) {
            console.error('Failed to create WebSocket:', err)
            setError('Failed to create WebSocket connection')
        }
    }, [])

    useEffect(() => {
        if (symbols.length === 0) return

        connect()

        return () => {
            // Cleanup on unmount
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }

            if (wsRef.current) {
                if (wsRef.current.pingInterval) {
                    clearInterval(wsRef.current.pingInterval)
                }
                if (wsRef.current.flushInterval) {
                    clearInterval(wsRef.current.flushInterval)
                }
                wsRef.current.close()
            }
        }
    }, [symbols.join(','), connect])

    return {
        prices,
        isConnected,
        error
    }
}

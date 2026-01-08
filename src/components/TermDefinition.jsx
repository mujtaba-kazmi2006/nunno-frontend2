import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

const TERM_DEFINITIONS = {
    'RSI': {
        term: 'RSI (Relative Strength Index)',
        definition: 'A momentum indicator that measures if something is overbought or oversold.',
        analogy: "Think of it like a thermometer for market momentum. Above 70 means it's 'too hot' (overbought), below 30 means it's 'too cold' (oversold).",
        example: 'If Bitcoin has an RSI of 75, it might be overbought and due for a pullback.'
    },
    'MACD': {
        term: 'MACD (Moving Average Convergence Divergence)',
        definition: 'Shows the relationship between two moving averages of prices.',
        analogy: "It's like watching two runners on a track. When the faster runner (MACD line) crosses above the slower one (signal line), it's bullish!",
        example: 'When MACD crosses above the signal line, traders often see it as a buy signal.'
    },
    'Support': {
        term: 'Support Level',
        definition: 'A price level where buyers usually step in to prevent further decline.',
        analogy: "Think of it as a safety net or floor. When prices fall to this level, buyers catch them.",
        example: 'If Bitcoin keeps bouncing off $40,000, that\'s a support level.'
    },
    'Resistance': {
        term: 'Resistance Level',
        definition: 'A price level where sellers usually appear to prevent further rise.',
        analogy: "It's like a ceiling. When prices rise to this level, sellers push them back down.",
        example: 'If Ethereum struggles to break above $3,000, that\'s resistance.'
    },
    'Market Cap': {
        term: 'Market Capitalization',
        definition: 'The total value of all coins in circulation.',
        analogy: "If a company's stock is like a pizza, market cap is the value of ALL the slices combined.",
        example: 'Bitcoin\'s market cap = Current Price × Total Bitcoins in Circulation'
    },
    'Liquidity': {
        term: 'Liquidity',
        definition: 'How easily you can buy or sell something without affecting its price.',
        analogy: "It's like selling lemonade. High liquidity = busy street (easy to sell). Low liquidity = empty street (hard to sell).",
        example: 'Bitcoin has high liquidity - you can buy or sell millions without moving the price much.'
    }
}

export default function TermDefinition({ term, children }) {
    const [isOpen, setIsOpen] = useState(false)

    const definition = TERM_DEFINITIONS[term]

    if (!definition) return children

    return (
        <>
            <span
                className="term-trigger"
                onClick={() => setIsOpen(true)}
            >
                {children}
                <HelpCircle size={14} className="help-icon" />
            </span>

            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="term-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{definition.term}</h3>
                            <button onClick={() => setIsOpen(false)} className="close-button">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="definition-section">
                                <h4>📖 Definition</h4>
                                <p>{definition.definition}</p>
                            </div>

                            <div className="analogy-section">
                                <h4>💡 Simple Analogy</h4>
                                <p>{definition.analogy}</p>
                            </div>

                            <div className="example-section">
                                <h4>✨ Example</h4>
                                <p>{definition.example}</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button onClick={() => setIsOpen(false)} className="btn-primary">
                                Got it! 👍
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

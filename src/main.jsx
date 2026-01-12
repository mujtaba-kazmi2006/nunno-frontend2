import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)

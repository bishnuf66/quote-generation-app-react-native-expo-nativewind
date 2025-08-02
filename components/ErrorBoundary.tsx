import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                    backgroundColor: '#f8f9fa'
                }}>
                    <ThemedText type="title" style={{ color: '#dc3545', marginBottom: 16 }}>
                        Oops! Something went wrong
                    </ThemedText>
                    <ThemedText style={{ textAlign: 'center', marginBottom: 20, color: '#6c757d' }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </ThemedText>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#007bff',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 8,
                        }}
                        onPress={() => this.setState({ hasError: false, error: undefined })}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}
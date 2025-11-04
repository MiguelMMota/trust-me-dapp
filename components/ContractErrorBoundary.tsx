'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ContractErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const isContractError = this.state.error?.message.includes('No contract addresses');
      const isNetworkError = this.state.error?.message.includes('chain ID');

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl border-2 border-red-200 dark:border-red-800 p-6 shadow-lg">
            <div className="text-center space-y-4">
              <div className="text-5xl">🚧</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isContractError || isNetworkError ? 'Contracts Not Deployed' : 'Something Went Wrong'}
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>
                  {isContractError || isNetworkError
                    ? 'The TrustMe smart contracts have not been deployed yet.'
                    : 'An unexpected error occurred.'}
                </p>
                {(isContractError || isNetworkError) && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-left">
                    <p className="font-semibold mb-2">To use TrustMe:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Deploy the smart contracts to Sepolia testnet</li>
                      <li>Update contract addresses in lib/contracts.ts</li>
                      <li>Ensure your wallet is connected to Sepolia</li>
                    </ol>
                  </div>
                )}
                {!isContractError && !isNetworkError && (
                  <details className="text-left">
                    <summary className="cursor-pointer text-sm font-medium">Error details</summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
                      {this.state.error?.message}
                    </pre>
                  </details>
                )}
              </div>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

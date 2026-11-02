import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Internal Application Error' };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary Caught Exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="glass-effect max-w-md w-full rounded-2xl p-8 border border-red-100 shadow-2xl space-y-6">
            <div className="p-4 bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">{t('errorBoundary.title')}</h2>
              <p className="text-sm text-fg-secondary">
                {t('errorBoundary.subtitle')}
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> {t('errorBoundary.reload')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundaryClass);

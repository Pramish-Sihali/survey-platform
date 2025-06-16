
// components/layouts/Footer.tsx


export function Footer() {
    return (
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">i</span>
              </div>
              <span className="text-gray-900 font-medium">
                <span className="text-teal-600">IXI</span>corp Survey Platform
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Terms of Service</a>
              <a href="#" className="hover:text-gray-900">Support</a>
            </div>
            
            <div className="text-sm text-gray-500">
              © 2024 IXIcorp. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    )
  }
 
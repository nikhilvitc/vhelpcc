import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              VHELP
            </Link>
            <p className="text-gray-600 mt-2 max-w-md">
              Discover amazing content across different categories. From education to entertainment, 
              we have something for everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Popular Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/education" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Education
                </Link>
              </li>
              <li>
                <Link href="/category/technology" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/category/design" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Design
                </Link>
              </li>
              <li>
                <Link href="/category/gaming" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Gaming
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              &copy; 2025 VHELP. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <span className="sr-only">Privacy Policy</span>
                Privacy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <span className="sr-only">Terms of Service</span>
                Terms
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <span className="sr-only">Contact</span>
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../auth/AuthProvider'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <header className="bg-white dark:bg-gray-800">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
      >
        {/* Logo */}
        <Link to="/" className="-m-1.5 p-1.5">
          <span className="sr-only">Sales Catalog</span>
          <img
            src="/logo192.png"
            alt="Sales Catalog Logo"
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop links */}
        <PopoverGroup className="hidden lg:flex lg:gap-x-6">
          <Link
            to="/products"
            className="text-sm font-medium text-gray-900 hover:text-indigo-600"
          >
            Products
          </Link>
          <Link
            to="/clients"
            className="text-sm font-medium text-gray-900 hover:text-indigo-600"
          >
            Clients
          </Link>
          <Link
            to="/discounts"
            className="text-sm font-medium text-gray-900 hover:text-indigo-600"
          >
            Discounts
          </Link>
          <Link
            to="/sales"
            className="text-sm font-medium text-gray-900 hover:text-indigo-600"
          >
            Sales
          </Link>
          <Link
            to="/users"
            className="text-sm font-medium text-gray-900 hover:text-indigo-600"
          >
            Users
          </Link>

          {/* Reports dropdown */}
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-medium text-gray-900 hover:text-indigo-600">
              Reports
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </PopoverButton>
            <PopoverPanel className="absolute z-10 mt-2 w-40 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black/5">
              <div className="py-1">
                <Link
                  to="/reports/top-products"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Reports Top Products and Clients
                </Link>
              </div>
            </PopoverPanel>
          </Popover>
        </PopoverGroup>

        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-gray-700 dark:text-gray-200"
          >
            <span className="sr-only">Open menu</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Logout button (desktop) */}
        {user && (
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="hidden lg:block text-sm font-medium text-gray-900 hover:text-red-600"
          >
            Logout
          </button>
        )}
      </nav>

      {/* Mobile drawer */}
      <Dialog
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="lg:hidden"
      >
        <div className="fixed inset-0 bg-black/25" />
        <DialogPanel className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="-m-1.5 p-1.5">
              <img
                src="/logo192.png"
                alt="Sales Catalog Logo"
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-700 dark:text-gray-200"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-2">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Products
            </Link>
            <Link
              to="/clients"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Clients
            </Link>
            <Link
              to="/discounts"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Discounts
            </Link>
            <Link
              to="/sales"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Sales
            </Link>
            <Link
              to="/users"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Users
            </Link>

            <Disclosure>
              {({ open }) => (
                <>
                  <DisclosureButton className="flex w-full items-center justify-between px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
                    Reports
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="space-y-1 pl-6">
                    <Link
                      to="/reports/top-products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Top products and clients
                    </Link>
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>

            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  logout()
                  navigate('/login')
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            )}
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}

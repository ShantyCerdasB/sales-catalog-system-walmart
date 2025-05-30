import React from 'react'

/**
 * Shared props for both PrimaryButton and SecondaryButton.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label or content */
  children: React.ReactNode
}

/**
 * A primary-style button with bold background color.
 *
 * Tailwind classes used:
 * - text-white
 * - bg-blue-700 / hover:bg-blue-800
 * - focus:ring-4 focus:ring-blue-300
 * - font-medium
 * - rounded-lg
 * - text-sm px-5 py-2.5
 * - me-2 mb-2
 * - dark:bg-blue-600 / dark:hover:bg-blue-700 / dark:focus:ring-blue-800
 */
export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={
      `text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 ` +
      `font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none ` +
      `dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ` +
      className
    }
    {...props}
  >
    {children}
  </button>
)

/**
 * A secondary-style button with light background and border.
 *
 * Tailwind classes used:
 * - text-gray-900
 * - bg-white / hover:bg-gray-100
 * - border border-gray-200
 * - text-sm py-2.5 px-5
 * - me-2 mb-2
 * - rounded-lg
 * - focus:ring-4 focus:ring-gray-100
 * - dark:bg-gray-800 / dark:border-gray-600 / dark:text-gray-400
 * - dark:hover:bg-gray-700 / dark:hover:text-white / dark:focus:ring-gray-700
 */
export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={
      `py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 bg-white rounded-lg ` +
      `border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 ` +
      `focus:outline-none focus:ring-4 focus:ring-gray-100 ` +
      `dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 ` +
      `dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 ` +
      className
    }
    {...props}
  >
    {children}
  </button>
)

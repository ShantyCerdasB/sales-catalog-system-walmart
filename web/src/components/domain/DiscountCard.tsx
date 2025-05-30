import React from 'react'

/**
 * Props for a discount record.
 */
interface Discount {
  id: string
  code: string
  percentage: number
  validFrom: string   // ISO date
  validTo?: string    // ISO date, optional
  isActive: boolean
}

interface Props {
  discount: Discount
  onActivate: (id: string) => void
  onDeactivate: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

/**
 * Displays a discount as a card, with controls to activate/deactivate/edit/delete.
 */
const DiscountCard: React.FC<Props> = ({
  discount,
  onActivate,
  onDeactivate,
  onEdit,
  onDelete,
}) => (
  <div className="border rounded-lg p-4 shadow-sm bg-white">
    <h3 className="text-lg font-semibold">{discount.code}</h3>
    <p className="text-sm">Percentage: {discount.percentage}%</p>
    <p className="text-sm">
      Valid: {new Date(discount.validFrom).toLocaleDateString()} –{' '}
      {discount.validTo
        ? new Date(discount.validTo).toLocaleDateString()
        : '∞'}
    </p>
    <p className="text-sm">
      Status:{' '}
      <span
        className={
          discount.isActive ? 'text-green-600' : 'text-gray-600'
        }
      >
        {discount.isActive ? 'Active' : 'Inactive'}
      </span>
    </p>
    <div className="mt-2 flex space-x-2">
      {discount.isActive ? (
        <button
          onClick={() => onDeactivate(discount.id)}
          className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
        >
          Deactivate
        </button>
      ) : (
        <button
          onClick={() => onActivate(discount.id)}
          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Activate
        </button>
      )}
      <button
        onClick={() => onEdit(discount.id)}
        className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(discount.id)}
        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  </div>
)

export default DiscountCard

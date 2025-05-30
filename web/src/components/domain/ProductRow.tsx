import React from 'react'

/**
 * Props for a single product row.
 */
interface Product {
  id: string
  code: string
  name: string
  price: number
  unit: string
  discount?: { percentage: number }
}

interface Props {
  product: Product
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

/**
 * Renders one row in the Products table, with Edit/Delete buttons.
 */
const ProductRow: React.FC<Props> = ({ product, onEdit, onDelete }) => (
  <tr>
    <td className="px-4 py-2">{product.code}</td>
    <td className="px-4 py-2">{product.name}</td>
    <td className="px-4 py-2">{product.price.toFixed(2)}</td>
    <td className="px-4 py-2">{product.unit}</td>
    <td className="px-4 py-2">
      {product.discount ? `${product.discount.percentage}%` : '—'}
    </td>
    <td className="px-4 py-2">
      <button
        onClick={() => onEdit(product.id)}
        className="text-indigo-600 hover:text-indigo-900 mr-2"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(product.id)}
        className="text-red-600 hover:text-red-900"
      >
        Delete
      </button>
    </td>
  </tr>
)

export default ProductRow

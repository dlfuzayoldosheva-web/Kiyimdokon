const ORDERS_KEY = 'montano_orders'

export function readOrders() {
  const saved = localStorage.getItem(ORDERS_KEY)
  if (!saved) return []

  const orders = JSON.parse(saved)
  if (!Array.isArray(orders)) {
    throw new Error('Saved order data has an invalid format.')
  }
  return orders
}

export function saveOrder(order) {
  const orders = readOrders()
  const updatedOrders = [order, ...orders]
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders))
  return updatedOrders
}

import { getOrdersList } from '@marketplaces/data-access';

export default async function handler(req, res) {
  try {
    // Obtener proyectos
    const orders = await getOrdersList(req.query.walletId, req.query.paginationLimit, req.query.filterByStatusCode, req.query.nextToken);
    // Respuesta exitosa
    return res.status(200).json(orders);
  } catch (error) {
    // Manejo de errores
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

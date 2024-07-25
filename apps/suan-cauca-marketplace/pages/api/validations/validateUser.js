import { validateUserStep2 } from "@marketplaces/data-access";

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const userId = req.query.userId

      if(!userId){
        res.status(405).json({ error: 'Id de usuario no hasido enviado' });
      }

      const userValidation = await validateUserStep2(userId);

      res.status(200).json(userValidation);
    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error occurred updating order:', error);
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
}
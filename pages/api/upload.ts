import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  // Read the body for the file
  





  res.status(200).json({ name: 'John Doe' })
}
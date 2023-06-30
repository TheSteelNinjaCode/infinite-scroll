import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { cursor } = req.query;
    let cursorNumber = Number(cursor);
    const PAGE_SIZE = 10;

    if (Number.isNaN(cursorNumber) || cursorNumber < 0) {
        cursorNumber = 0;
    }

    try {

        if (req.method === 'GET') {
            if (cursorNumber) {
                const users = await prisma.user.findMany({
                    cursor: { id: cursorNumber },
                    orderBy: {
                        id: 'asc'
                    },
                    take: PAGE_SIZE,
                });

                let nextCursor = users.length > 0 ? users[users.length - 1].id + 1 : null;

                if (nextCursor === cursorNumber)
                    nextCursor = null

                return res.status(200).json({ users, nextCursor });
            }
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'An error occurred while fetching user' });
    }
}
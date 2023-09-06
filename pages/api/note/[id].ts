import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const noteId = req.query.id;
   
    switch (req.method) {
        case 'DELETE':
            const note = await prisma.note.delete({
                where: { id: Number(noteId) }
            });
            res.json(note);
            break;
        case 'PUT':
            const { title, content } = req.body;
            const updateNote = await prisma.note.update({
                where: { id: Number(noteId) },
                data: {
                    title: title,
                    content: content
                },
            })
            res.json(updateNote);
            break;
        default:
            console.log('Note could not be created!');
            break;
    }
    
}
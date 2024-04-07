import { Contact } from "@/models/Contact"
import connect from "@/utils/db"
import { NextResponse } from "next/server"


interface IParams {
    id: string;
  }

  export const PATCH = async (
    request: Request,
    { params }: { params: IParams }
) => {
    try {
        await connect();
        const { id } = params;
        const body = await request.json();

        let updatedMail;
        if (body.read) {
            updatedMail = await Contact.findByIdAndUpdate(id, { read: true }, { new: true });
        } else if (body.unread) {
            updatedMail = await Contact.findByIdAndUpdate(id, { read: false }, { new: true });
        } else {
            throw new Error('Invalid request body');
        }

        return new NextResponse(JSON.stringify(updatedMail), { status: 200 });
    } catch (err) {
        console.error('Error while processing PATCH request:', err);
        return new NextResponse('Database Error', { status: 500 });
    }
}


export const DELETE = async (
  request: Request,
  { params }: { params: IParams }
) => {
  try {
      await connect();
      const { id } = params;

      // Delete the mail with the specified ID
      const deletedMail = await Contact.findByIdAndDelete(id);

      return new NextResponse(JSON.stringify(deletedMail), { status: 200 });
  } catch (err) {
      console.error('Error while processing DELETE request:', err);
      return new NextResponse('Database Error', { status: 500 });
  }
};
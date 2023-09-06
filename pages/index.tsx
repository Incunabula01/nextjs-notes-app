import { Inter } from 'next/font/google';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { prisma } from '@/lib/prisma';
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ['latin'] });

interface NotesProps {
  notes: {
    id: string,
    title: string,
    content: string
  }[]
}
interface FormData  {
  title: string;
  content: string;
  id: string;
}

const Home: React.FC<NotesProps> = ({ notes }) => {
  const [form, setForm] = useState<FormData>({title: '', content: '', id: ''});
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const router = useRouter();

  const create = async (data: FormData) => {
    try {
      fetch('http://localhost:3000/api/create', {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }).then(() => {
        setForm({ title: '', content: '', id: '' });
        refreshData();
      })
    } catch (error) {
      console.error('Note not created!', error);
    }
  }

  const update = (note: FormData) => {
    try {
      fetch(`http://localhost:3000/api/note/${note.id}`, {
        body: JSON.stringify(note),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PUT'
      }).then(() => {
        setForm({ title: '', content: '', id: '' });
        setIsUpdated(false);
        refreshData();
      })
    } catch (error) {
      console.error('Note not updated!', error);
    }
  }

  const handleDelete = (id: string) => {
    try {
      fetch(`http://localhost:3000/api/note/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'DELETE'
      }).then(() => {
        setForm({ title: '', content: '', id: '' });
        refreshData();
      })
    } catch (error) {
      console.error('Note not deleted!', error);
    }
  }

  const handleUpdate = (id: string) => {
    const getNotes = notes.find(el => el.id === id) as FormData;
    setIsUpdated(true);
    setForm(getNotes);
  }

  const handleSubmit = async (data: FormData) => {
    try {
      if(isUpdated){
        update(data);
      } else {
        create(data);
      }
      
    } catch (error) {
      console.error('Create failed!', error);
    }
  }

  const refreshData = () => {
    router.replace(router.asPath);
  }

  return (
    <main className={`${inter.className} mt-8`}>
      <h1 className="text-center font-bold text-2xl mt-4">
        Notes
      </h1>
      <form className="w-auto min-w-[25%] max-w-min mx-auto space-y-6 flex flex-col items-stretch" onSubmit={(event) => {
        event.preventDefault();
        handleSubmit(form);
      }}
      >
        <input 
          type="text" 
          placeholder='Title' 
          value={form.title} 
          onChange={(event) => setForm({...form, title: event.target.value})}
          className="border-2 rounded border-gray-600 p-1"
          />
        <textarea
          placeholder='Content'
          value={form.content}
          onChange={(event) => setForm({ ...form, content: event.target.value })}
          className="border-2 rounded border-gray-600 p-1"
        />
        <button type="submit" className="bg-blue-500 text-white rounded p-1">{isUpdated ? 'Update Note' : 'Add Note'}</button>
      </form>
      <div className="w-auto min-w-[25%] max-w-min mt-20 mx-auto space-y-6 flex flex-col items-stretch">
        <ul>
          {notes && notes.map(note => (
            <li key={note.id} className='border-b norder-gray-600 p-2'>
              <div className="flex justify-between gap-1">
                <div className="flex-1">
                  <h3 className="font-bold">{note.title}</h3>
                  <p className="text-small">{note.content}</p>
                </div>
                <button className="bg-blue-500 px-2 py-2 text-white rounded" onClick={() => handleUpdate(note.id)}>Update</button>
                <button className="bg-red-500 px-2 py-2 text-white rounded" onClick={() => handleDelete(note.id)}>X</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const notes = await prisma.note.findMany({
    select: {
      title: true,
      id: true,
      content: true
    }
  });
  return {
    props: {
      notes
    }
  }
}
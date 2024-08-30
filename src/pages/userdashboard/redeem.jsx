import React, { useState, useRef, useEffect } from 'react'; // Ensure useRef is imported
import { PencilIcon } from "@heroicons/react/24/solid";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Textarea,
} from "@material-tailwind/react";
import { useUser } from "../../context/AuthContext";
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
import {  collection, addDoc } from "firebase/firestore"; 
import { FirebaseStorage, FirebaseFirestore} from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; 

const TABLE_HEAD = ["Transaction", "Points", "Date", "Status", "Actions",];
 
const TABLE_ROWS = [
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-spotify.svg",
    name: "Spotify",
    amount: "$2,500",
    date: "Wed 3:00pm",
    status: "paid",

  },
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-amazon.svg",
    name: "Amazon",
    amount: "$5,000",
    date: "Wed 1:00pm",
    status: "paid",
 
  },
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-pinterest.svg",
    name: "Pinterest",
    amount: "$3,400",
    date: "Mon 7:40pm",
    status: "pending",
 
  },
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-google.svg",
    name: "Google",
    amount: "$1,000",
    date: "Wed 5:00pm",
    status: "paid",

  },
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-netflix.svg",
    name: "netflix",
    amount: "$14,000",
    date: "Wed 3:30am",
    status: "cancelled",
   
  },
];


export function Redeem() {
  const { user } = useUser();
  const [open, setOpen] = React.useState(false);
  const [fileName, setFileName] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [file, setFile] = useState(null);

  const [formValues, setFormValues] = useState({
    deadline: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;
  
    if (name === 'deadline') {
      formattedValue = new Date(value);
    }

    setFormValues({
      ...formValues,
      [name]: formattedValue,
    });

  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setFileName(file.name);
      await getNumberOfPages(file);
    }
  };
  const getNumberOfPages = async (file) => {
    try {
      const pdfData = await file.arrayBuffer();
      const pdf = await getDocument({ data: pdfData }).promise;
      setNumPages(pdf.numPages);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };
  const handleDownload = async (e) => {
    e.preventDefault();
    
    try {
    const fileRef = ref(FirebaseStorage, 'pdfs/samplee (1).pdf');

    const downloadURL = await getDownloadURL(fileRef);
    console.log('Download URL:', downloadURL);

    // Open the PDF in a new tab
    window.open(downloadURL, '_blank');  
    
  
    } catch (error) {
      // Handle errors
      console.error("Error downloading file:", error.message);
      alert("Error downloading file: " + error.message);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('File:', file);
      console.log('File Size:', file.size);
      console.log('File Type:', file.type);
      
      const metadata = {
        contentType: 'application/pdf',
      };
      const storageRef = ref(FirebaseStorage, `pdfs/${fileName}`);
      
      console.log('Uploading file...');
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      console.log('Upload Result:', uploadResult);
  
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL:', downloadURL);
  
      console.log('Adding document to Firestore...');
      await addDoc(collection(FirebaseFirestore, "requests"), {
        userid: user.uid,
        filename: fileName,
        deadline: formValues.deadline,
        fileRef: formValues.deadline,
        downloadUrl: downloadURL,
      });
  
      console.log("Document successfully written with file!");
    } catch (e) {
      console.error('Error:', e);
      alert('An error occurred. Check the console for details.');
    }
  };


  const handleOpen = () => setOpen(!open);

  const [showAlerts, setShowAlerts] = React.useState({
    blue: true,
    green: true,
    orange: true,
    red: true,
  });
  const [showAlertsWithIcon, setShowAlertsWithIcon] = React.useState({
    blue: true,
    green: true,
    orange: true,
    red: true,
  });
  const alerts = ["gray", "green", "orange", "red"];

  return (
    <div className="mx-auto my-14 flex max-w-screen-lg flex-col gap-8">
      <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              Redeem Rewards
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              These are the details regarding with user's prize redeeming request.

            </Typography>
          </div>
          <div className="flex w-full shrink-0 gap-2 md:w-max">
            <div className="w-full md:w-72">
              <Input
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <Button onClick={handleOpen} className="flex items-center gap-3" size="sm">
              <ArrowDownTrayIcon strokeWidth={2} className="h-4 w-4" /> Send a Request
            </Button>
            <Dialog open={open} size="xs" handler={handleOpen}>
        <div className="flex items-center justify-between">
          <DialogHeader className="flex flex-col items-start">
            {" "}
            <Typography className="mb-1" variant="h4">
              Redeem Rewards
            </Typography>
          </DialogHeader>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mr-3 h-5 w-5"
            onClick={handleOpen}
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <form onSubmit={handleSubmit}>
        <DialogBody>
          <Typography className="mb-6 -mt-7 " color="gray" variant="lead">
            Insert the file (pdf) you want to be printed.
          </Typography>

          <div className="grid gap-6 mb-2">
            <input type="file" onChange={handleFileChange} 
        className="w-full text-gray-500 font-medium text-sm bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded" />
        {numPages !== null && <Typography variant='medium'>Number of Pages: {numPages}</Typography>}
          </div>
          <Typography className="-mb-1 mb-2" color="blue-gray" variant="h6">
              Expected Deadline
            </Typography>
            <Input onChange={handleInputChange}  name='deadline' type='datetime-local' />
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="text" color="gray" onClick={handleOpen}>
            cancel
          </Button>
          <Button  type="submit" variant="gradient" color="gray" onClick={handleOpen}>
            Send Request
          </Button>
        </DialogFooter>
        </form>
      </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map(
              (
                {
                  img,
                  name,
                  amount,
                  date,
                  status,
                },
                index,
              ) => {
                const isLast = index === TABLE_ROWS.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";
 
                return (
                  <tr key={name}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={img}
                          alt={name}
                          size="md"
                          className="border border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1"
                        />
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {name}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {amount}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {date}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={status}
                          color={
                            status === "paid"
                              ? "green"
                              : status === "pending"
                              ? "amber"
                              : "red"
                          }
                        />
                      </div>
                    </td>
                   
                    <td className={classes}>
                      <Tooltip content="Edit User">
                        <IconButton variant="text">
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </CardBody>
      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Button variant="outlined" size="sm">
          Previous
        </Button>
       
        <Button onClick={handleDownload} variant="outlined" size="sm">
          Next
        </Button>
      </CardFooter>
    </Card>
    </div>
  );
}

export default Redeem;

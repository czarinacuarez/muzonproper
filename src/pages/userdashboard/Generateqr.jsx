import QRCode from 'qrcode';
import React, { useState, useEffect } from 'react';
import { FirebaseAuth, FirebaseFirestore } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { BeakerIcon } from '@heroicons/react/24/solid'
import { IconButton } from "@material-tailwind/react";

import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";
 
const Generateqr = () => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(!open);

  const [userId, setUserId] = useState(null);
  const [qrcode, setQrcode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FirebaseAuth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email || '');

        const qrCodeDocRef = doc(FirebaseFirestore, 'qrCodes', user.uid);
        const qrCodeDoc = await getDoc(qrCodeDocRef);

        if (qrCodeDoc.exists()) {
          const existingQrCodeId = qrCodeDoc.data().id;
          setQrCodeGenerated(true);
          generateQRCode(existingQrCodeId);
        } else {
          setQrCodeGenerated(false);
        }
      } else {
        setUserId(null);
        setQrCodeGenerated(false);
        setUserEmail('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGenerateQRCode = async () => {
    if (!userId) return;

    const newQrCodeId = userId;

    await setDoc(doc(FirebaseFirestore, 'qrCodes', userId), {
      id: newQrCodeId,
      email: userEmail,
      createdAt: new Date(),
    });

    setQrCodeGenerated(true);
    generateQRCode(newQrCodeId);
  };

  const generateQRCode = (qrCodeValue) => {
    QRCode.toDataURL(
      qrCodeValue,
      {
        width: 800,
        margin: 1,
      },
      (err, url) => {
        if (err) {
          console.error(err);
          return;
        }
        setQrcode(url);
      }
    );
  };

  return (
    <>
      <IconButton onClick={handleOpen} variant="text">
        <span className='absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-5 w-5 text-blue-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
          </svg>
        </span>      
      </IconButton>
      <Dialog open={open} handler={handleOpen} className='p-2'>
        <DialogHeader className='flex justify-center p-0'>User Identity</DialogHeader>
        <DialogBody className="relative flex justify-center w-auto max-w-3xl p-0">
          {userId ? (
            <>
              {!qrCodeGenerated ? (
                <Button variant="gradient" color="green" className='my-2' onClick={handleGenerateQRCode}>
                  Generate QR
                </Button>
              ) : null}
              {qrcode && (
                <>
                  <img src={qrcode} alt="QR Code" />
                </>
              )}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </DialogBody>
        <DialogFooter className="space-x-2 p-0">
          <Button variant="text" onClick={handleOpen}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default Generateqr;
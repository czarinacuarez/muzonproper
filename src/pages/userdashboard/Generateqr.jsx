import QRCode from 'qrcode';
import React, { useState, useEffect } from 'react';
import { FirebaseAuth, FirebaseFirestore } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { BeakerIcon } from '@heroicons/react/24/solid'

const Generateqr = () => {
  const [userId, setUserId] = useState(null);
  const [qrcode, setQrcode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

    const newQrCodeId = userId; // Use userId as the QR code ID

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
      {/* Button to open the modal */}
      <button   onClick={() => setShowModal(true)} type='button' className='relative align-middle select-none font-sans font-medium text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-10 max-w-[40px] h-10 max-h-[40px] rounded-lg text-xs text-blue-gray-500 hover:bg-blue-gray-500/10 active:bg-blue-gray-500/30'>
        <span className='absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-5 w-5 text-blue-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
          </svg>
        </span>
      </button>
      {/* Modal */}
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/* Content */}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none h-3/6">
                {/* Header */}
                {/* <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t"> */}
                  {/* <h3 className="text-3xl font-semibold text-black mx-auto">Generate QR Code</h3> */}
                  {/* <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button> */}
                {/* </div> */}
                {/* Body */}
                <div className="relative p-6 flex-auto">
                  {userId ? (
                    <>
                      {!qrCodeGenerated ? (
                        <button
                          onClick={handleGenerateQRCode}
                          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Generate QR Code
                        </button>
                      ) : (
                        <p className='text-black text-center'>Your QR Code is ready:</p>
                      )}

                      {qrcode && (
                        <>
                          <img src={qrcode} alt="QR Code" className="mt-4" />
                          <a href={qrcode} download="qrcode.png">
                            <button className="bg-red-200 mt-2 p-2 text-black">Download QR Code</button>
                          </a>
                        </>
                      )}
                    </>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                {/* Footer */}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
};

export default Generateqr;
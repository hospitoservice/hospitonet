import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

import { Appointment } from '../../types.ts';
// No need for AppointmentWithPrescription anymore, we can use Appointment directly
interface PrescriptionHubProps {
  appointments: Appointment[];  // Now using Appointment directly
  onPrescriptionSelect: (prescription: { image: string; appointmentId?: string }) => void;
  onClose: () => void;
}


const PrescriptionHub: React.FC<PrescriptionHubProps> = ({ 
  appointments, 
  onPrescriptionSelect, 
  onClose 
}) => {
  const [view, setView] = useState<'main' | 'camera' | 'appointments'>('main');
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onPrescriptionSelect({
          image: imageSrc,
        });
        onClose();
      }
    }
  }, [webcamRef, onPrescriptionSelect, onClose]);

  const pickImage = async () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            onPrescriptionSelect({
              image: result,
            });
            onClose();
          }
        };
        
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const handleTakePhoto = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => setView('camera'))
        .catch((err) => {
          console.error('Camera access error:', err);
          alert('Could not access the camera. Please ensure you have granted camera permissions.');
        });
    } else {
      alert('Camera is not supported in your browser.');
    }
  };

  const renderMainView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Prescription Hub</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span className="material-icons-round text-gray-500 dark:text-gray-400">close</span>
        </button>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={handleTakePhoto}
          className="w-full flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
            <span className="material-icons-round text-blue-600 dark:text-blue-300">camera_alt</span>
          </div>
          <div className="text-left">
            <h4 className="font-medium text-gray-900 dark:text-white">Take Photo</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Upload a new prescription using camera</p>
          </div>
          <span className="material-icons-round text-gray-400 ml-auto">chevron_right</span>
        </button>

        <button
          onClick={pickImage}
          className="w-full flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
            <span className="material-icons-round text-purple-600 dark:text-purple-300">upload_file</span>
          </div>
          <div className="text-left">
            <h4 className="font-medium text-gray-900 dark:text-white">Upload from Gallery</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Select prescription from your device</p>
          </div>
          <span className="material-icons-round text-gray-400 ml-auto">chevron_right</span>
        </button>

        <button
          onClick={() => setView('appointments')}
          className="w-full flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <span className="material-icons-round text-green-600 dark:text-green-300">history</span>
          </div>
          <div className="text-left">
            <h4 className="font-medium text-gray-900 dark:text-white">From Appointments</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Select from previous appointments</p>
          </div>
          <span className="material-icons-round text-gray-400 ml-auto">chevron_right</span>
        </button>
      </div>
    </div>
  );

  const renderCameraView = () => (
    <div className="bg-black flex-1 flex flex-col relative">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-0 right-0 p-4">
        <button 
          onClick={() => setView('main')}
          className="p-2 bg-black/50 rounded-full text-white"
        >
          <span className="material-icons-round">close</span>
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center bg-gradient-to-t from-black/70 to-transparent">
        <button
          onClick={capture}
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
        >
          <span className="material-icons-round text-gray-900">camera_alt</span>
        </button>
      </div>
    </div>
  );

  const renderAppointmentsView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4">
        <button 
          onClick={() => setView('main')}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span className="material-icons-round text-gray-500 dark:text-gray-400">arrow_back</span>
        </button>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Prescription</h3>
        <div className="w-8"></div> {/* For alignment */}
      </div>
      
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div 
              key={appointment.id}
              onClick={() => {
                if (appointment.prescription && appointment.prescription.length > 0) {
                  onPrescriptionSelect({
                    image: appointment.prescription[0],
                    appointmentId: appointment.id
                  });
                  onClose();
                }
              }}
              className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="material-icons-round text-gray-400">description</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">Prescription</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {appointment.doctorName} • {appointment.date}
                  </p>
                </div>
                {appointment.prescription && appointment.prescription.length > 0 ? (
                  <span className="text-green-500 text-xs font-medium">Available</span>
                ) : (
                  <span className="text-gray-400 text-xs">No prescription</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <span className="material-icons-round text-gray-300 text-4xl">folder_open</span>
            <p className="mt-2 text-gray-500 dark:text-gray-400">No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {view === 'main' && renderMainView()}
      {view === 'camera' && renderCameraView()}
      {view === 'appointments' && renderAppointmentsView()}
    </div>
  );
};

export default PrescriptionHub;

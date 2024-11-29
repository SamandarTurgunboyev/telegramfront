import React, { useState, useRef, useEffect } from 'react';

const VoiceRecorder = ({ audioUrl, setAudioUrl }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0); // Timer state
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null); // Timer reference

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current);
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            audioChunksRef.current = [];
            clearInterval(timerRef.current); // Clear timer on stop
            setDuration(0); // Reset duration
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        startTimer();
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    const startTimer = () => {
        setDuration(0);
        timerRef.current = setInterval(() => {
            setDuration((prev) => prev + 1);
        }, 1000); // Increment duration every second
    };

    const clearRecording = () => {
        setAudioUrl('');
        setDuration(0); // Reset duration when clearing
    };

    const sendRecording = () => {
        alert('Sending audio: ' + audioUrl);
    };

    useEffect(() => {
        return () => clearInterval(timerRef.current); // Cleanup timer on unmount
    }, []);

    return (
        <div className="voice-recorder">
            {audioUrl ?
                <div className='flex flex-row justify-center items-center gap-2'>
                    <button onClick={clearRecording}>Clear</button>
                    <audio controls src={audioUrl} />
                </div>
                :
                <>
                    
                </>
            }
        </div>
    );
};

export default VoiceRecorder;
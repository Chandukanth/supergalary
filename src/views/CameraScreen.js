import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useRecoilState } from 'recoil';
import { activeTab } from '../lib/atom';
import { Video } from 'expo-av';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

const CameraScreen = () => {
  const cameraRef = useRef(null);
  const [isRecording, setRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState('');
  const [capturedVideo, setCapturedVideo] = useState(null);
  console.log("🚀 ~ file: CameraScreen.js:18 ~ CameraScreen ~ capturedVideo:", capturedVideo)
  const isFocused = useIsFocused();
  const [index, setIndex] = useRecoilState(activeTab);
  const [isModalVisible, setModalVisible] = useState(false);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [camera, setCamera] = useState(null);
  const video = React.useRef(null);
  useEffect(() => {
    let mounted = true;

    (async () => {
      // Request camera and audio recording permissions
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
      const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();

      if (
        cameraStatus === 'granted' &&
        audioStatus === 'granted' &&
        mediaLibraryStatus === 'granted'
      ) {
        startCamera();
      } else {
        alert('Camera, audio, and media library permissions are required.');
      }
    })();

    return () => {
      // Cleanup function to stop the camera when the component unmounts
      mounted && stopCamera();
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Start or stop the camera based on the screen focus
    if (index === 0) {
      startCamera();
    } else {
      stopCamera();
    }

    // Cleanup function to stop the camera when the component unmounts
    return () => {
      stopCamera();
    };
  }, [index]);

  const startCamera = async () => {
    if (cameraRef.current) {
      await cameraRef.current.resumePreview();
    }
  };

  const stopCamera = async () => {
    if (cameraRef.current) {
      await cameraRef.current.pausePreview();
    }
  };

  const flipCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const onMediaPress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        if (result.type === 'image') {
          setCapturedImage(result.uri);
          setModalVisible(true);
        } else if (result.type === 'video') {
          setCapturedVideo(result.uri);
          setModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Error selecting media:', error);
    }
  };

  const handleSaveMedia = async () => {
    if (capturedImage) {
      await saveImageToLibrary();
    } else if (capturedVideo) {
      await saveVideoToLibrary();
    }

    setModalVisible(false);
  };

  const saveImageToLibrary = async () => {
    try {
      const asset = await MediaLibrary.createAssetAsync(capturedImage);
      console.log('Image saved to library successfully:', asset);
    } catch (error) {
      console.error('Error saving image to library:', error);
    }
  };

  const saveVideoToLibrary = async () => {
    try {
      const asset = await MediaLibrary.createAssetAsync(capturedVideo);
      console.log('Video saved to library successfully:', asset);
    } catch (error) {
      console.error('Error saving video to library:', error);
    }
  };

  const handleCancelSave = () => {
    setModalVisible(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
    setRecording(!isRecording);
  };

  const startRecording = async () => {
    if (cameraRef) {
      setRecording(true);
      let { uri } = await cameraRef.recordAsync();
      setCapturedVideo(uri);
    }
  };

  const stopRecordingPress = async () => {
    await stopRecording();
  };

  const stopRecording = async () => {
    setRecording(false);
    if (cameraRef) {
       cameraRef.stopRecording();
    }
  };

  const handleButtonPress = async () => {
    if (isRecording) {
      setRecording(false);
      return toggleRecording();
    } else if (!isRecording && cameraRef.current) {
      const { uri } = await cameraRef.current.takePictureAsync();
      setCapturedImage(uri);
      setModalVisible(true);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {index === 0 && (
        <>
          <Camera
            ref={cameraRef}
            style={{ flex: 1, width: '100%' }}
            type={cameraType}
            flashMode={Camera.Constants.FlashMode.off}
          />
          <TouchableOpacity onPress={flipCamera} style={styles.flipContainer}>
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryContainer} onPress={onMediaPress}>
            <Ionicons name="file-tray-full-outline" size={26} color="black" />
          </TouchableOpacity>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleButtonPress}
              onLongPress={toggleRecording}
              style={styles.button}
            />
          </View>
          {isRecording && <Text onPress={stopRecording}>Stop Recording</Text>}

          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContainer}>
              {capturedImage && (
                <Image source={{ uri: capturedImage }} style={styles.modalMedia} />
              )}
              {capturedVideo && (
                <Video
                ref={video}
                style={styles.modalMedia}
                source={{ uri: capturedVideo }}

                useNativeControls
                resizeMode="contain"
                isLooping
                // onPlaybackStatusUpdate={status => setStatus(() => status)}
             />
                // <Video
                //   source={{ uri: capturedVideo }}
                //   rate={1.0}
                //   volume={1.0}
                //   isMuted={false}
                //   resizeMode="cover"
                //   shouldPlay
                //   style={styles.modalMedia}
                // />
              )}
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity onPress={handleSaveMedia}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelSave}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    bottom: 0,
    left: '40%',
    marginBottom: 20,
    flexDirection: 'row',
  },
  flipContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    bottom: 20,
    left: '10%',
    marginBottom: 20,
    flexDirection: 'row',
  },
  galleryContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 50,
    bottom: 20,
    right: '10%',
    marginBottom: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalMedia: {
    flex: 1
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  modalButtonText: {
    color: 'blue',
    fontSize: 18,
  },
});

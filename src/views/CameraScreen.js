import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { Camera } from 'expo-camera';
import { useRecoilState } from 'recoil';
import { activeTab } from '../lib/atom';
import { Video } from 'expo-av';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { insertBulkImages, insertImage } from '../database/db';
import * as ImagePicker from 'expo-image-picker';
import { GLView } from 'expo-gl';

const CameraScreen = () => {
  const cameraRef = useRef(null);
  const [isRecording, setRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState('');
  const [capturedVideo, setCapturedVideo] = useState('');
  const [index, setIndex] = useRecoilState(activeTab);
  const [isModalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [cameraStatus, setCameraStatus] = useState(null)
  const [audioStatus, setAudioStatus] = useState(null)

  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const glRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const requestPermissions = async () => {
      // Request camera and audio recording permissions
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setCameraStatus(cameraStatus);
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
      setAudioStatus(audioStatus);
    
    };

    if (mounted) {
      requestPermissions();
    }

    return () => {
      // Cleanup function to stop the camera when the component unmounts
      // mounted && stopCamera();
      mounted = false;
    };
  }, [cameraStatus, audioStatus]);
  if (cameraStatus !== 'granted' || audioStatus !== 'granted') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>You need camera and microphone access to continue</Text>
      </View>
    );
  }

  // useEffect(() => {
  //   // Start or stop the camera based on the screen focus
  //   if (index == 0) {
  //     startCamera();
  //   } else {
  //     stopCamera();
  //   }

  //   // Cleanup function to stop the camera when the component unmounts
  //   return () => {
  //     stopCamera();
  //   };
  // }, [index]);

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
    // Toggle between front and back camera types
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const onMediaPress = async (name) => {

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        // Handle selected images (result.uri or result.uris for multiple)
        const selectedImages = Array.isArray(result.assets) ? result.assets : [result.uri];
        // Assuming you have an array of objects representing images
        const imagesToInsert = selectedImages.map(image => ({
          url: image.uri,  // Use image.uri directly
          comment: '',     // You can set a default comment or leave it empty
          isLiked: 0,      // You can set a default value for isLiked
          created_at: new Date().toISOString(), // Set the current date/time
        }));

        // Insert the selected images into the database
        await insertBulkImages(imagesToInsert);
        console.log('Selected images inserted successfully');
        // Optionally, you can reload the media data or perform other actions after insertion
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      // Handle the error appropriately
    }


  };

  const handleSaveImage = () => {
    console.log('Image saved:', capturedImage);
    insertImage(capturedImage, comment, 0, new Date().toISOString())
      .then((result) => {
        console.log('Image saved to database:', result);
      })
      .catch((error) => {
        console.error('Error saving image to database.', error);
      });
    setModalVisible(false);
    setComment("")
  };

  const handleCancelSave = () => {
    // Close the modal
    setModalVisible(false);
  };



  const startRecording = async () => {
    setRecording(true)

    if (cameraRef.current) {
      let video = await cameraRef.current.recordAsync();
      insertImage(video?.uri, '', 0, new Date().toISOString())
      .then((result) => {
        console.log('Video saved to database:', result);
        setCapturedVideo("")
      })
      .catch((error) => {
        console.error('Error saving Video to database.', error);
      });
      setCapturedVideo(video?.uri);
    }
  };

  const stopRecordingPress = async () => {
    setRecording(false)
    await stopRecording()
  }

  const stopRecording = async () => {
    setRecording(false)
    if (cameraRef.current) {
      await cameraRef.current.stopRecording();
    
    }
  };

  const handleButtonPress = async () => {
    if (isRecording) {
      return stopRecording()
    }
    else if (!isRecording && cameraRef.current) {
      const { uri } = await cameraRef.current.takePictureAsync();
      setCapturedImage(uri);
      setModalVisible(true)
    }
  };
  const onContextCreate = async (gl) => {
    // Initialize GL context
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // Compile shaders, set up framebuffers, etc.
    // You can use this space to create your own custom GL filters/effects.
    // For simplicity, let's just pass through the input for now.

    // Set the clear color and clear the framebuffer
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.endFrameEXP();

    glRef.current = gl;
  };

  const handleCommentChange = (text) => {
    setComment(text);
  };

  const onRenderFrame = () => {
    // Render each frame
    if (glRef.current) {
      // You can apply your GL filters/effects here
      // For example, you can use shaders to create live filters
      // For simplicity, we'll just render the camera texture as-is
      glRef.current.endFrameEXP();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {index == 0 && (
        <>
          <Camera
            ref={cameraRef}
            style={{ flex: 0.999, width: '140%' }}
            type={cameraType}
            flashMode={Camera.Constants.FlashMode.off}
          />
           <GLView
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onContextCreate={onContextCreate}
            onRenderFrame={onRenderFrame}
          />
          <TouchableOpacity onPress={flipCamera} style={styles.flipContainer}>
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.galaryContainer} onPress={onMediaPress} >
            <Ionicons name="file-tray-full-outline" size={26} color="black" />
          </TouchableOpacity>
          <View
            style={styles.buttonContainer}
          >

            <TouchableOpacity onPress={handleButtonPress}
              onLongPress={startRecording} style={styles.button}>
              {isRecording && (
                <View style={{ width: 40, height: 40, backgroundColor: 'red' }}>

                </View>
              )}

            </TouchableOpacity>
          </View>


          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContainer}>
              <Image source={{ uri: capturedImage }} style={styles.modalImage} />
              <View style={styles.commentContainer}>
          
              <TextInput
                style={styles.commentInput}
                placeholder="Add memory description..."
                value={comment}
                onChangeText={handleCommentChange}
              />
           
          </View>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity onPress={handleSaveImage}>
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
    flexDirection: 'row'
  },
  flipContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    bottom: 20,
    left: '10%',
    marginBottom: 20,
    flexDirection: 'row'
  },
  galaryContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 50,
    bottom: 20,
    right: '10%',
    marginBottom: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    backgroundColor: 'red', // Change color to red when recording
  },
  buttonText: {
    fontSize: 14,
    color: 'black',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    margin: 10,
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
  commentContainer: {
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 40,
    marginBottom: 8,
    width: '90%',
    paddingLeft: 20
  },
  commentSubmit: {
    color: 'blue',
  },
});

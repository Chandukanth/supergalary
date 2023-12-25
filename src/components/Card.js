import React, { useState, useRef } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import Collapsible from 'react-native-collapsible';
import * as FileSystem from 'expo-file-system';
import { useRecoilState } from 'recoil';
import { colaps } from '../lib/atom';
import VideoPlayer from './VideoPlayer';
import Modal from 'react-native-modal';
import * as Permissions from 'expo-permissions';
import RNFS from 'react-native-fs';
const { height, width } = Dimensions.get('window');

const Card = ({ item, onDelete, onLike, onComment, outOfBoundItems, viewableItems }) => {

  const styles = StyleSheet.create({
    cardContainer: {
      margin: 10,
      padding: 16,
      height: item?.url.toLowerCase().endsWith('.mp4') ? height - 68 : 280,
      backgroundColor: 'white',
      borderRadius: 10,
      elevation: 3, // for shadow on Android
      shadowColor: '#000', // for shadow on iOS
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    cardImage: {
      flex: 1,
      borderRadius: 8,
      objectFit: 'cover',
      backgroundColor: 'black'
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 10,
      justifyContent: 'space-between',
      width: '60%',
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
    existingCommentContainer: {
      marginTop: 10,
      backgroundColor: '#f0f0f0',
      padding: 8,
      borderRadius: 8,
    },
    existingCommentText: {
      color: '#333',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black'
    },
    modalContent: {
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      borderRadius: 10,
      overflow: 'hidden',
    },
    modalImage: {
      flex: 1,
      width: '100%',
      height: '100%',
      objectFit:'contain'
    },
  });


  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState(item.comment || '');
  const [isCollapsed, setCollapsed] = useRecoilState(colaps);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleScreenChange = async (playbackStatus) => {
    if (videoRef.current) {
      const isPlaying = playbackStatus.isPlaying;

      // Check if the video is currently visible on the screen
      if (isPlaying && isVideoVisible) {
        // Video is visible and playing
      } else {
        // Video is not visible or not playing, pause it
        videoRef.current.pauseAsync();
      }
    }
  };
  const videoRef = useRef(null);

  const toggleCollapse = () => {
    setCollapsed(!isCollapsed);
    if (!item.comment && !isCommenting) {
      setIsCommenting(true);
    }
  };

  const handleCommentChange = (text) => {
    setComment(text);
  };

  const handleCommentSubmit = () => {
    onComment(comment, item?.id);
    setIsCommenting(false);
  };

 
  const handleDownload = async () => {
    try {
      // Ask for storage permission
  
      
        alert('Downloaded successfully');

      
      
    } catch (error) {
      console.error('Error downloading media:', error);
    }
  };
  const onShare = async () => {
    try {
      const sharingOptions = {
        dialogTitle: 'Share Media', // Specify the dialog title here
      };

      const result = await Sharing.shareAsync(item?.url, {
        dialogTitle: item?.comment,
      });

      if (result.action === Sharing.sharedAction) {
        console.log('Shared successfully');
      } else if (result.action === Sharing.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  const onVideoEnteredScreen = () => {
    // Set the state to indicate that the video is visible
    setIsVideoVisible(true);
  };

  const onVideoExitedScreen = () => {
    // Set the state to indicate that the video is not visible
    setIsVideoVisible(false);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };



  return (
    <View onEnter={onVideoEnteredScreen}
      onExit={onVideoExitedScreen} style={styles.cardContainer}>
      {item?.url.toLowerCase().endsWith('.jpg') || item?.url.toLowerCase().endsWith('.jpeg') || item?.url.toLowerCase().endsWith('.png') ? (
        <TouchableOpacity style={styles.cardImage} onPress={toggleModal}>
          <Image source={{ uri: item?.url }} style={styles.cardImage} />
        </TouchableOpacity>
      ) : (
        <VideoPlayer
          height={height / 1.6}
          width={width}
          videoUri={viewableItems?.url}
          item={item}
          isCollapsed={isCollapsed}
          outOfBoundItems={outOfBoundItems}
        />
      )}

      <View style={styles.cardActions}>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={onLike}>
            {item?.isLiked ? (
              <Ionicons name="heart" size={24} color="red" />
            ) : (
              <Ionicons name="heart-outline" size={24} color="black" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCollapse}>
            <Ionicons name="chatbubble-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare}>
            <Ionicons name="share-social-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownload}>
            <Ionicons name="download-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onDelete}>
          <Ionicons name="trash-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Collapsible easing={'easeInOutCubic'} collapsed={isCollapsed}>
        {isCommenting && (
          <View style={styles.commentContainer}>
            <>
              <TextInput
                style={styles.commentInput}
                placeholder="Add memory description..."
                value={comment}
                onChangeText={handleCommentChange}
              />
              <TouchableOpacity onPress={handleCommentSubmit}>
                <Ionicons name="send-outline" size={24} color="black" />
              </TouchableOpacity>
            </>
          </View>
        )}

        {item.comment && !isCommenting && (
          <TouchableOpacity onPress={() => setIsCommenting(true)} style={styles.existingCommentContainer}>
            <Text style={styles.existingCommentText}>{item.comment}</Text>
          </TouchableOpacity>
        )}
      </Collapsible>
      <Modal
        isVisible={isModalVisible}
        style={styles.modalContainer}
        swipeDirection="down"
        onSwipeComplete={toggleModal}
        onBackdropPress={toggleModal}
        propagateSwipe={true}
      >
        <View style={styles.modalContent}>
          <Image source={{ uri: item?.url }} style={styles.modalImage} />
        </View>
        <TouchableOpacity
          style={{ position: 'absolute', top: 10, right: 10 }}
          onPress={toggleModal}
        >
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </Modal>
    </View>
  );

};


export default Card;

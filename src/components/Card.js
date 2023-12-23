import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from Expo
import * as Sharing from 'expo-sharing';
import Collapsible from 'react-native-collapsible';
import * as FileSystem from 'expo-file-system';

const Card = ({ item, onDelete, onLike, onComment }) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState(item.comment || '');
  const [isCollapsed, setCollapsed] = useState(false);


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
      const localFilePath = item.url.startsWith('file://')
        ? item.url
        : `${FileSystem.documentDirectory}downloaded_image.jpg`;
  
      await FileSystem.copyAsync({
        from: localFilePath,
        to: `${FileSystem.documentDirectory}new_location/downloaded_image.jpg`,
      });
  
      console.log('Downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  

  const onShare = async () => {
    try {
      const sharingOptions = {
        dialogTitle: 'Share Image', // Specify the dialog title here
      };

      const result = await Sharing.shareAsync(item.url, {
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

  return (
    <View style={styles.cardContainer}>
      <Image source={{ uri: item.url }} style={styles.cardImage} />
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
        {isCommenting &&
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
        }


        {item.comment && !isCommenting && (
          <TouchableOpacity onPress={() => setIsCommenting(true)} style={styles.existingCommentContainer}>
            <Text style={styles.existingCommentText}>{item.comment}</Text>
          </TouchableOpacity>
        )}
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    margin: 10,
    padding: 16,
    height: 280,
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
});

export default Card;

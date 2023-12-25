import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, RefreshControl , Dimensions } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { deleteImage, fetchImages, insertBulkImages, updateComment, updateImageLikedStatus } from '../database/db';
import { useRecoilState } from 'recoil';
import { activeIndex, activeTab, colaps } from '../lib/atom';
import Card from '../components/Card';
import { FloatingAction } from "react-native-floating-action";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
const { height: screenHeight } = Dimensions.get('screen')

const AllMedia = () => {
  const [media, setMedia] = useState([]);
  const [index, setIndex] = useRecoilState(activeTab);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isCollapsed, setCollapsed] = useRecoilState(colaps);
  const [viewAbleItems, setViewAbleItems] = useState(null)
  const [dynamicViewLogic, setDynamicViewLogic] = useState(false);
  const [active, setActive] = useRecoilState(activeIndex);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);
  useEffect(() => {
    // Load media from the database on mount
    loadMedia();
  }, [index, active]);


  const loadMedia = async () => {
    try {
      // Fetch images from the database
      const mediaData = await fetchImages();
      // Set the media state with the fetched data
      setMedia(mediaData);
    } catch (error) {
      console.error('Error fetching media data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
  
    // Call your refresh logic here
    await loadMedia();
  
    setRefreshing(false);
  };

  const handleComment = async (comment, id) => {
    try {
      await updateComment(id, comment);
      // Refresh the media data after the comment action
      loadMedia();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteImage(id);
      // Close the delete confirmation modal
      setDeleteModalVisible(false);
      // Refresh the media data after the delete action
      loadMedia();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleLike = async (id, isLiked) => {
    try {
      // Toggle the liked status in the database
      const newLikeStatus = isLiked ? 0 : 1;
      await updateImageLikedStatus(id, newLikeStatus);
      // Refresh the media data after the like action
      loadMedia();
    } catch (error) {
      console.error('Error updating liked status:', error);
    }
  };

  const showDeleteModal = (id) => {
    // Show the delete confirmation modal
    setSelectedImageId(id);
    setDeleteModalVisible(true);
  };

  const hideDeleteModal = () => {
    // Hide the delete confirmation modal
    setDeleteModalVisible(false);
    setSelectedImageId(null);
  };

  const actions = [
    {
      text: "Open Camera",
      icon: <Ionicons name="camera" size={26} color="white" />,
      name: "camera",
      position: 2
    },
    {
      text: "Choose from galary",
      icon: <Ionicons name="md-file-tray" size={26} color="white" />,
      name: "file",
      position: 1
    },

  ];

  const FloatingButtonPress = async (name) => {
    if (name == 'camera') {
      setIndex(0);
    } else {
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
          loadMedia();
          console.log('Selected images inserted successfully');
          // Optionally, you can reload the media data or perform other actions after insertion
        }
      } catch (error) {
        console.error('Error selecting images:', error);
        // Handle the error appropriately
      }

    }
  };


  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length !== 0) {
      setDynamicViewLogic(viewableItems)
    }
    // Handle the viewable items based on the dynamicViewLogic state
    if (viewableItems.length !== 0) {
      setViewAbleItems(viewableItems[0].item)
      // Custom logic when dynamicViewLogic is true
    }

  }

  const viewabilityConfigCallbackPairs = useRef([
    { onViewableItemsChanged },
  ]);

  return (
    <>
      {index == 1 && active == 0 && (
        <View style={{ flex: 1}}>
          {media.length === 0 &&
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <Text>No media available </Text>
              <Text>click on plus button to add media</Text>

            </View>}
          {media.length > 0 &&
            <FlatList
              ref={flatListRef}
              data={media.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} // Add this line
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Card
                  item={item}
                  onDelete={() => showDeleteModal(item.id)}
                  onLike={() => handleLike(item.id, item.isLiked)}
                  onComment={(comment) => handleComment(comment, item.id)}
                  onShare={() => console.log('Share')}
                  viewableItems={viewAbleItems}
                  outOfBoundItems={dynamicViewLogic}
                />
              )}
              viewabilityConfig={{ itemVisiblePercentThreshold: 30, waitForInteraction: true }}
              viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
            />
          }
          {media.length == 0 &&
            <FloatingAction
              actions={actions}
              onPressItem={name => {
                FloatingButtonPress(name);
              }}
            />
          }

          {/* Delete Confirmation Modal */}
          <Portal>
            <Dialog visible={deleteModalVisible} onDismiss={hideDeleteModal}>
              <Dialog.Title>Delete Image</Dialog.Title>
              <Dialog.Content>
                <Text>Are you sure you want to delete this image?</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hideDeleteModal}>Cancel</Button>
                <Button onPress={() => handleDelete(selectedImageId)}>Delete</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      )}

    </>

  );
};

export default AllMedia;

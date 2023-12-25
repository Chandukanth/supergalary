import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Text, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Feather } from "react-native-vector-icons";
import VideoControls from './VideoControls';

const { height, width } = Dimensions.get('window');
export default function VideoPlayer(props) {
    const {
        videoUri,
        outOfBoundItems,
        item,
        isCollapsed
    } = props;
    const styles = StyleSheet.create({
        video: {
            alignSelf: 'center',
            width: width - 30,
            height:!isCollapsed ? height / 1.45 : height /1.3,
            marginHorizontal : 20
        },
        container: {
            flex: 1,
            justifyContent: 'center'
        },
        controlsContainer: {
            position: 'absolute',
            bottom:isCollapsed ? 10 : 50
        }
    });
    const playbackInstance = useRef(null);
    const [playbackInstanceInfo, setPlaybackInstanceInfo] = useState({
        position: 0,
        duration: 0,
        state: 'Paused'
    });
    const [isMuted, setIsMuted] = useState(false)
    useEffect(() => {
        return () => {
            if (playbackInstance.current) {
                playbackInstance.current.setStatusAsync({
                    shouldPlay: false
                })
            }
        }
    }, []);
    useEffect(() => {
        playbackInstance.current.pauseAsync();
    }, [outOfBoundItems]);
    const togglePlay = async () => {
        const shouldPlay = playbackInstanceInfo.state !== 'Playing';
        if (playbackInstance.current !== null) {
            await playbackInstance.current.setStatusAsync({
                shouldPlay,
                ...(playbackInstanceInfo.state === 'Ended' && { positionMillis: 0 }),
            })
            setPlaybackInstanceInfo({
                ...playbackInstanceInfo,
                state:
                    playbackInstanceInfo.state === 'Playing'
                        ? 'Paused'
                        : 'Playing',
            })
        }
    }
    const updatePlaybackCallback = (status) => {
        if (status.isLoaded) {
            setPlaybackInstanceInfo({
                ...playbackInstanceInfo,
                position: status.positionMillis,
                duration: status.durationMillis || 0,
                state: status.didJustFinish ? 'Ended' :
                    status.isBuffering ? 'Buffering' :
                        status.shouldPlay ? 'Playing' : 'Paused'
            })
        } else {
            if (status.isLoaded === false && status.error) {
                const errorMsg = `Encountered a fatal error during playback: ${status.error}`;
                console.log(errorMsg, 'error')
                // setErrorMessage(errorMsg)
            }
        }
    }

    const toggleMuted = () => {
        setIsMuted(!isMuted)
    }
    return (
        <View style={{ flex: 1, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image style={{ height: 30, width: 30, borderRadius: 30 }} source={{ uri: item.profile }} />
                    <Text style={{ marginLeft: 10, color: '#fff', fontSize: 15, fontWeight: 'bold' }}>
                        {item?.name}
                    </Text>
                </View>
                <View>
                    <Feather name="more-vertical" color="#fff" size={18} />
                </View>
            </View>
            <Video
                ref={playbackInstance}
                style={styles.video}
                source={{ uri: videoUri }}
                resizeMode="cover"
                isLooping={false}
                isMuted={isMuted}
                shouldPlay
                onPlaybackStatusUpdate={updatePlaybackCallback}
            />
            <View style={styles.controlsContainer}>
                <VideoControls
                    state={playbackInstanceInfo.state}
                    playbackInstance={playbackInstance.current}
                    playbackInstanceInfo={playbackInstanceInfo}
                    setPlaybackInstanceInfo={setPlaybackInstanceInfo}
                    togglePlay={togglePlay}
                    toggleMuted={toggleMuted}
                    isMuted={isMuted}
                />
            </View>
        </View>
    );
}

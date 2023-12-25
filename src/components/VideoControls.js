import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, TouchableOpacity } from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Ionicons } from '@expo/vector-icons';


const VideoControls = (props) => {

    const {
        state,
        togglePlay,
        playbackInstanceInfo,
        setPlaybackInstanceInfo,
        playbackInstance,
        toggleMuted,
        isMuted
    } = props;

    function renderIcon() {
        if (state === 'Buffering') {
            return <ActivityIndicator size={20} color="white" />;
        } else if (state === 'Playing') {
            return <FontAwesome name="pause" size={18} color="#fff" />;
        } else if (state === 'Paused') {
            return <FontAwesome name="play" size={20} color="#fff" />;
        } else if (state === 'Ended') {
            return <MaterialIcons name="replay" size={20} color="#fff" />;
        }
    }


    return (
        <View style={styles.container}>

            <View tint="dark" intensity={42} style={styles.innerContainer}>

                <Pressable style={styles.iconWrapper} onPress={state === 'Buffering' ? null : togglePlay}>
                    {renderIcon()}
                </Pressable>
                <TouchableOpacity style={{ marginRight: 8 }} onPress={() => toggleMuted()}>
                    {isMuted && state !== 'Ended' ? (
                        <Ionicons name="volume-mute" size={20} color="#fff" />

                    ) : (
                        <Ionicons name="volume-high" size={20} color="#fff" />

                    )}


                </TouchableOpacity>


            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 50,
        width: '100%',
        height: 20,
        justifyContent: 'space-between'
    },
    iconWrapper: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 50,
        borderRadius: 50
    },
    slider: {
        flex: 1,
        marginHorizontal: 20
    },
});


export default VideoControls;
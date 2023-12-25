import React, { useState } from "react";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import AllMedia from "./AllMedia";
import LikedMedia from "./LikedMedia";
import { useRecoilState } from "recoil";
import { activeIndex } from "../lib/atom";


const SuperGalary = () => {
    const [index, setIndex] = useRecoilState(activeIndex);
    const [routes] = useState([
        { key: "first", title: "All" },
        { key: "second", title: "Liked" },
    ]);

    const renderScene = SceneMap({
        first: AllMedia,
        second: LikedMedia,
    });

    return (
        <TabView
            navigationState={{ index, routes }}
            tabBarPosition={'top'}

            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={(props) => (
                <TabBar
                    {...props}
                    indicatorStyle={{ backgroundColor: "black" }}
                    style={{ backgroundColor: "white" }}
                    labelStyle={{ color: "black" }}
                />
            )}
        />
    )
}
export default SuperGalary
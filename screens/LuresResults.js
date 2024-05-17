import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";
import {
  btn_style,
  flex_style,
  padding_styles,
  text_style,
  img_styles,
  margin_styles,
} from "../global/global-styles";
import {
  primary_color,
  black,
  NAV_LURES_RESULTS,
  tutorial_styles,
  ICON_SIZE_S,
  SpacingExtraSmall,
} from "../global/global-constants";
import { loadTranslations } from "../global/localization";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { environment } from "../global/environment";
import { reactIfView, responseDataHandler } from "../global/global-functions";
import { getAuthToken } from "../global/utils/auth.utils";
import { getNextTutorialForPage } from "../global/utils/tutorial.utils";
import TutorialTooltip from "./TutorialTooltip";

export default function LuresResults({ route }) {
  const moonPhaseLabels = {
    1: loadTranslations("lastMoonPhaseNewMoon"),
    2: loadTranslations("lastMoonPhaseFirstQuarter"),
    3: loadTranslations("lastMoonPhaseFullMoon"),
    4: loadTranslations("lastMoonPhaseLastQuarter"),
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lures, setLures] = useState(null);
  const [weather, setWeather] = useState(null);
  const [moon, setMoon] = useState(null);
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [expertImage, setExpertImage] = useState("");
  const [caption, setCaption] = useState("");

  const expertConfig = {
    pike: {
      image:
        "https://storage.googleapis.com/puggum-bucket/Screenshot%202024-04-20%20at%206.14.24%E2%80%AFPM%20(1).jpg",
      caption: loadTranslations("luresRecommendedByLucas"),
    },
    walleye: {
      image:
        "https://storage.googleapis.com/puggum-bucket/Screenshot%202024-04-20%20at%206.14.24%E2%80%AFPM%20(1).jpg",
      caption: loadTranslations("luresRecommendedByLucas"),
    },
    lakeTrout: {
      image:
        "https://storage.googleapis.com/puggum-bucket/Screenshot%202024-04-20%20at%206.14.24%E2%80%AFPM%20(2).jpg",
      caption: loadTranslations("luresRecommendedByHugo"),
    },
    rainbowTrout: {
      image:
        "https://storage.googleapis.com/puggum-bucket/Screenshot%202024-04-20%20at%206.14.24%E2%80%AFPM%20(2).jpg",
      caption: loadTranslations("luresRecommendedByHugo"),
    },
    brookTrout: {
      image:
        "https://storage.googleapis.com/puggum-bucket/Screenshot%202024-04-20%20at%206.14.24%E2%80%AFPM%20(2).jpg",
      caption: loadTranslations("luresRecommendedByHugo"),
    },
    brownTrout: {
      image:
        "https://storage.googleapis.com/puggum-bucket/Screenshot%202024-04-20%20at%206.14.24%E2%80%AFPM%20(2).jpg",
      caption: loadTranslations("luresRecommendedByHugo"),
    },
  };

  useEffect(() => {
    if (route.params.species) {
      const config = expertConfig[route.params.species];
      if (config) {
        setExpertImage(config.image);
        setCaption(config.caption);
      }
    }
  }, [route.params.species]);

  useEffect(() => {
    if (route.params) {
      fetchResultsForConditons();
    }
  }, []);

  useEffect(() => {
    const getTut = async () => {
      const tut = await getNextTutorialForPage(NAV_LURES_RESULTS);
      setCurrentTutorial(tut);
    };
    if (initialLoad) {
      getTut();
      setInitialLoad(false);
    }
  }, []);

  const fetchResultsForConditons = async () => {
    setLoading(true);
    const url = `${environment.host}api/lures?lat=${route.params.lat}&long=${route.params.long}&species=${route.params.species}&structure=${route.params.structure}&waterClarity=${route.params.waterClarity}&userLures=${route.params.userLures}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-app-auth": getAuthToken(),
      },
    });

    const res = await responseDataHandler(response);
    setLoading(false);
    setLures(res?.lures);
    if (res?.moonPhases) {
      setMoon({
        prevPhase: res?.moonPhases?.prevPhase,
        nextPhase: res?.moonPhases?.nextPhase,
      });
    }
    if (res.previousWeather) {
      setWeather({
        precipitation: res?.previousWeather?.data?.precipitation,
        windGust: res?.previousWeather?.data?.windGust,
      });
    }
  };

  const WeatherAndMoonPhase = ({ weather, moonPhase, waterCondition }) => (
    <View style={styles.weatherContainer}>
      <View style={styles.weatherItem}>
        <MaterialIcons name="dark-mode" size={ICON_SIZE_S} color="black" />
        {reactIfView(
          moonPhase.prevPhase.daysSinceLast === 0 &&
            moonPhase.nextPhase.daysUntilNext === 0, //day of
          <Text style={{ marginLeft: SpacingExtraSmall }}>
            {loadTranslations(`todayMoonPhase${moonPhase.prevPhase.phase}`)}
            {moonPhase.prevPhase.phase === 2 || moonPhase.prevPhase.phase === 4
              ? ` : ${loadTranslations("fishLessActive")}`
              : ""}
            {moonPhase.prevPhase.phase === 1 || moonPhase.prevPhase.phase === 3
              ? ` : ${loadTranslations("fishMoreActive")}`
              : ""}
            {loadTranslations("nextMoonPhase")}:{" "}
            {loadTranslations(`lastMoonPhase${moonPhase.nextPhase.phase}`)}{" "}
            {loadTranslations("in")} {moonPhase.nextPhase.daysUntilNext}{" "}
            {loadTranslations("days")}
          </Text>
        )}
        {reactIfView(
          moonPhase.prevPhase.daysSinceLast === 1, // day before
          <View>
            <Text style={{ marginLeft: SpacingExtraSmall }}>
              {loadTranslations("lastMoonPhase")}:{" "}
              {loadTranslations(`lastMoonPhase${moonPhase.prevPhase.phase}`)}{" "}
              {moonPhase.prevPhase.daysSinceLast} {loadTranslations("daysAgo")}
              {moonPhase.prevPhase.phase === 1 ||
              moonPhase.prevPhase.phase === 3
                ? ` : ${loadTranslations("fishFullFromFeeding")}`
                : ""}
            </Text>
            <Text style={{ marginLeft: SpacingExtraSmall }}>
              {loadTranslations("nextMoonPhase")}:{" "}
              {loadTranslations(`lastMoonPhase${moonPhase.nextPhase.phase}`)} in{" "}
              {moonPhase.nextPhase.daysUntilNext} {loadTranslations("days")}
              {moonPhase.nextPhase.daysUntilNext <= 2 &&
              moonPhase.nextPhase.phase === 1
                ? ` : ${loadTranslations("fishMoreActive")}`
                : ""}
            </Text>
          </View>
        )}
        {reactIfView(
          moonPhase.prevPhase.daysSinceLast !== 1 &&
            moonPhase.prevPhase.daysSinceLast !== 0, //else
          <View>
            <Text style={{ marginLeft: SpacingExtraSmall }}>
              {loadTranslations("lastMoonPhase")}:{" "}
              {loadTranslations(`lastMoonPhase${moonPhase.prevPhase.phase}`)}{" "}
              {Math.abs(moonPhase.prevPhase.daysSinceLast)}{" "}
              {loadTranslations("daysAgo")}
              {moonPhase.prevPhase.phase === 1 ||
              moonPhase.prevPhase.phase === 3
                ? ` : ${loadTranslations("fishFullFromFeeding")}`
                : ""}
            </Text>
            <Text style={{ marginLeft: SpacingExtraSmall }}>
              {loadTranslations("nextMoonPhase")}:{" "}
              {loadTranslations(`lastMoonPhase${moonPhase.nextPhase.phase}`)} in{" "}
              {moonPhase.nextPhase.daysUntilNext} {loadTranslations("days")}
              {moonPhase.nextPhase.daysUntilNext <= 2 &&
              moonPhase.nextPhase.phase === 1
                ? ` : ${loadTranslations("fishMoreActive")}`
                : ""}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.weatherItem}>
        <MaterialIcons name="water-drop" size={ICON_SIZE_S} color="black" />
        <Text style={{ marginLeft: 5 }}>
          {weather.precipitation
            ? loadTranslations("rainedFishFed")
            : loadTranslations("noPrecipitationsFishHungry")}
        </Text>
      </View>
      <View style={styles.weatherItem}>
        <MaterialIcons name="air" size={ICON_SIZE_S} color="black" />
        <Text style={{ marginLeft: SpacingExtraSmall }}>
          {weather.windGust > 10 && waterCondition !== "Muddy"
            ? loadTranslations("windYesterdayWaterDirty")
            : `${weather.windGust} mph`}
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.image }}
        style={[img_styles.rectangle_image_s, { width: 100 }]}
      />
      <View style={styles.detailsContainer}>
        <TutorialTooltip
          conditions={currentTutorial == "LureBrands" && index == 0}
          style={tutorial_styles.singleLine}
          tutorial="LureBrands"
          translations="tutBrands"
          tutRoute={NAV_LURES_RESULTS}
          setCurrentTutorial={setCurrentTutorial}
        />

        <TutorialTooltip
          conditions={currentTutorial == "LureModels" && index == 0}
          style={tutorial_styles.singleLine}
          tutorial="LureModels"
          translations="tutModel"
          tutRoute={NAV_LURES_RESULTS}
          setCurrentTutorial={setCurrentTutorial}
        />
        <Text style={{ fontWeight: "bold" }}>
          {item.brand} - {item.model}
        </Text>

        <TutorialTooltip
          conditions={currentTutorial == "LureType" && index == 0}
          style={tutorial_styles.singleLine}
          tutorial="LureType"
          translations="tutType"
          tutRoute={NAV_LURES_RESULTS}
          setCurrentTutorial={setCurrentTutorial}
        />
        <Text>
          {loadTranslations("type")}: {item.type}
        </Text>

        <TutorialTooltip
          conditions={currentTutorial == "LureColors" && index == 0}
          style={tutorial_styles.doubleLine}
          tutorial="LureColors"
          translations="tutColors"
          tutRoute={NAV_LURES_RESULTS}
          setCurrentTutorial={setCurrentTutorial}
        />
        <Text>
          {loadTranslations("colors")}: {item.color1}/{item.color2}
        </Text>

        <TutorialTooltip
          conditions={currentTutorial == "LureSize" && index == 0}
          style={tutorial_styles.singleLine}
          tutorial="LureSize"
          translations="tutSize"
          tutRoute={NAV_LURES_RESULTS}
          setCurrentTutorial={setCurrentTutorial}
        />
        {/* size attr here */}

        <TutorialTooltip
          conditions={currentTutorial == "LureWeight" && index == 0}
          style={tutorial_styles.singleLine}
          tutorial="LureWeight"
          translations="tutWeight"
          tutRoute={NAV_LURES_RESULTS}
          setCurrentTutorial={setCurrentTutorial}
        />
        <Text>
          {loadTranslations("weight")}: {item.weight}oz
        </Text>

        <TutorialTooltip
          conditions={currentTutorial == "LurePrice" && index == 0}
          style={tutorial_styles.doubleLine}
          tutorial="LurePrice"
          translations="tutPrice"
          tutRoute={NAV_LURES_RESULTS}
          setCurrentTutorial={setCurrentTutorial}
        />
        <Text style={{ fontWeight: "bold" }}>
          {loadTranslations("price")}: ${item.price}
        </Text>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    itemContainer: {
      flexDirection: "row",
      padding: 10,
      alignItems: "center",
      marginVertical: 7,
      marginHorizontal: 10,
      borderRadius: 20,
      backgroundColor: "rgb(251, 255, 251)",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    detailsContainer: {
      flex: 1,
      marginLeft: 3,
    },
    weatherContainer: {
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 10,
      backgroundColor: "rgba(253, 253, 253, 1)",
      borderRadius: 20,
      margin: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    weatherItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <TutorialTooltip
        conditions={currentTutorial == "ResultsGuide"}
        style={tutorial_styles.doubleLine}
        tutorial="ResultsGuide"
        translations="tutGuide"
        tutRoute={NAV_LURES_RESULTS}
        setCurrentTutorial={setCurrentTutorial}
        placement="bottom"
        tooltipStyle={[{ marginTop: 100 }]}
      />
       {lures && lures.length > 0 ? (
      <>
      <Image
        source={{ uri: expertImage }}
        style={{ width: "100%", height: 330 }}
      />
      <Text
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 15,
          marginTop: 9,
          marginBottom: 4,
        }}
      >
        {caption}
      </Text>
      <ScrollView>
        {weather && (
          <WeatherAndMoonPhase
            weather={weather}
            moonPhase={moon}
            waterCondition={route.params.waterClarity}
          />
        )}
        <FlatList
          data={lures}
          renderItem={renderItem}
          keyExtractor={(item, index) => `lure-${index}`}
        />
      </ScrollView>
       </>
    ) : (
      <View style={[margin_styles.vertical_space_xxl]}>
        <Text style={[text_style.apple_auth, text_style.alignCenter]}>
          {loadTranslations("noLureForConditions")}
        </Text>
      </View>
    )}
    </View>
  );
}

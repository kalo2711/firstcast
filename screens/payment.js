import React, { useState, useEffect } from "react";
import { useStripe } from '@stripe/stripe-react-native';
import {
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  StyleSheet,
  Pressable,
  TouchableOpacity
} from "react-native";
import {
  btn_style,
  flex_style,
  padding_styles,
  text_style,
  img_styles,
  margin_styles
} from "../global/global-styles";
import {
  primary_color,
  black,
  NAV_LURES_RESULTS,
  tutorial_styles,
  ICON_SIZE_S,
  SpacingExtraSmall,
  RES_VALID,
  NAV_PROFILE
} from "../global/global-constants";
import { loadTranslations } from "../global/localization";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { environment } from "../global/environment";
import { reactIfView, responseDataHandler } from "../global/global-functions";
import { getAuthToken } from "../global/utils/auth.utils";
import { getNextTutorialForPage } from "../global/utils/tutorial.utils";
import TutorialTooltip from "./TutorialTooltip";

export default function Intent({ navigation }) {
  const [intetnId, setIntentId] = useState('');
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [token, setToken] = useState("");
  const [subInfo, setSubInfo] = useState({});
  const [subType, setSubType] = useState("");
  
  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    //fetch sub data
    if (token){
      fetchSubData();
    }
  }, [token]);

  async function getToken(){
      const t = await getAuthToken(false);
      setToken(t);
    }

  async function fetchSubData(){
    const url = environment.authHost + "api/user/subinfo";
    let res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'x-app-auth': token
      }
    });
    
    const data = await responseDataHandler(res, false);
    if (data) {
      setSubInfo(data);
    }else {
      console.error("error");
    }
  }

  async function onSetSubscription(subType){
    const url = environment.authHost + "api/user/addsubinfo";
    let res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'x-app-auth': token
      },
      body: JSON.stringify({"subType": subType})
    });
    let responseJSON = await res.json();
    if (responseJSON.status === RES_VALID) {
      Alert.alert('Subscribed');
    } else {
      Alert.alert('Problem occured');
    }
  }

  const createIntent = async (amount) => {
    const url = `${environment.host}/payments/intent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-auth": getAuthToken(),
      },
      body: JSON.stringify({amount: amount})
    });
    

    let responseJSON = await response.json();
    if (responseJSON.status === RES_VALID) {
      return responseJSON.paymentIntent;
    } else {
      return null;
    }
  };

  const onCheckout = async () => {
    if (subInfo.trialUsed === 1){
      let amount = 0;
      switch (subType){
        case 'M':
          amount = 495;
          break;
        case 'Y':
          amount = 995;
          break;
        case 'L':
          amount = 9995;
        break;
      }
      // 1. Create a payment intent
      const response = await createIntent(amount);
      // 2. Initialize the Payment sheet
      const initResponse = await initPaymentSheet({
        merchantDisplayName: 'notJust.dev',
        paymentIntentClientSecret: response,
      });
      if (initResponse.error) {
        Alert.alert('Something went wrong');
        return;
      }
      
      // 3. Present the Payment Sheet from Stripe
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        Alert.alert(`Error code: ${paymentError.code}`, paymentError.message);
        return;
      } 
    }
    // 4. If payment ok -> set subscription
    onSetSubscription(subType);
    navigation.navigate(NAV_PROFILE);
  };

  return (
    <ScrollView
      nestedScrollEnabled={true}
      contentContainerStyle={[
        flex_style.flex,
        flex_style.flexContainer,
        padding_styles.safetyTop,
        padding_styles.space_md,
        styles.noMarginNoPadding,
        // { flexWrap: "wrap" },
        { height: '100%' },
        { justifyContent: 'space-between'}
      ]}
    >
      <Text style={[text_style.s, margin_styles.top_md, text_style.bold, text_style.alignCenter]}>{loadTranslations("firstCastPlusMoto")}</Text>
      <Text style={[text_style.sm, margin_styles.bottom_md, text_style.bold]}>{loadTranslations("tryFreeTrial")}</Text>
      <View>
        <View style={[flex_style.flex, flex_style.width100, flex_style.spaceEvenly, margin_styles.bottom_xs]}>
          <Image source={require('../assets/sub-page-lures.jpg')} style={[img_styles.icon_ss, img_styles.slight_border,{resizeMode: 'cover'}]}/>
          <View style={[flex_style.flexColumn, flex_style.width70]}>
            <Text style={[text_style.bold]}>{loadTranslations("lureResTitle")}</Text>
            <Text style={[flex_style.width100]}>{loadTranslations("lureResults")}</Text>
          </View>
        </View>
      </View>
      <View>
        <View style={[flex_style.flex, flex_style.width100, flex_style.spaceEvenly, margin_styles.bottom_xs]}>
          <Image source={require('../assets/sub-page-water.jpg')} style={[img_styles.icon_ss, img_styles.slight_border,{resizeMode: 'cover'}]}/>
          <View style={[flex_style.flexColumn, flex_style.width70]}>
            <Text style={[text_style.bold]}>{loadTranslations("conditionTitle")}</Text>
            <Text style={[flex_style.width100]}>{loadTranslations("conditionResults")}</Text>
          </View>
        </View>
      </View>
      <View>
        <View style={[flex_style.flex, flex_style.width100, flex_style.spaceEvenly, margin_styles.bottom_xs]}>
          <Image source={require('../assets/sub-page-fishing.jpg')} style={[img_styles.icon_ss, img_styles.slight_border,{resizeMode: 'cover'}]}/>
          <View style={[flex_style.flexColumn, flex_style.width70]}>
            <Text style={[text_style.bold]}>{loadTranslations("catchID")}</Text>
            <Text style={[flex_style.width100]}>{loadTranslations("lureRequest")}</Text>
          </View>
        </View>
      </View>
      <View
        style={[
          flex_style.flexColumn,
          flex_style.width100,
          flex_style.spaceBetween,
          flex_style.whiteBackground,
          flex_style.borderRadiusTopCorners,
          padding_styles.minorTop,
          { alignSelf: 'flex-end', elevation: 5}
        ]}>
        <View
        style={[
          flex_style.flexColumn,
          flex_style.width100,
          flex_style.spaceBetween,
        ]}>
          <View
            style={[
              flex_style.flex,
              flex_style.spaceEvenly,
              flex_style.alignEnd,
              flex_style.width100
            ]}>
            <TouchableOpacity
              onPress={() => {
                setSubType("M");
              }}
              style={[
                btn_style.button,
                subType === "M" ? btn_style.buttonReversed : btn_style.buttonReversedDisabled,
                btn_style.borderWidth2,
                btn_style.buttonTwoFifthWidth,
                btn_style.backgroundColorNone,
                margin_styles.vertical_space_md,
              ]}
            >
              <Text>{loadTranslations("1month")}</Text>
              <Text
                style={[
                  text_style.primaryColor,
                  text_style.bold,
                  flex_style.width100,
                  text_style.alignCenter,
                  text_style.md
                ]}
              >4.95$ </Text>
              <Text style={[text_style.fontColorBlack]}>{loadTranslations("monthly")} </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubType("Y");
              }}
              style={[
                btn_style.button,
                subType === "Y" ? btn_style.buttonReversed : btn_style.buttonReversedDisabled,
                btn_style.borderWidth2,
                btn_style.buttonTwoFifthWidth,
                btn_style.backgroundColorNone,
                margin_styles.vertical_space_md,
                padding_styles.noneVertical
              ]}
            >
              <Text style={[
                text_style.alignCenter,
                margin_styles.none, 
                subType === "Y" ? [flex_style.backgroundColorPrimary, text_style.fontColorWhite] : btn_style.buttonDisabled, 
                flex_style.borderRadiusTopCorners_xs,
                {width: '100%'}
                ]}>{loadTranslations("recommended")}</Text>
              <Text>{loadTranslations("12months")}</Text>
              <Text
                style={[
                  text_style.primaryColor,
                  text_style.bold,
                  flex_style.width100,
                  text_style.alignCenter,
                  text_style.md
                ]}
              >9.95$ </Text>
              <Text style={[text_style.fontColorBlack]}>{loadTranslations("yearly")} </Text>
              <Text style={[
                text_style.alignCenter,
                margin_styles.none, 
                subType === "Y" ? [flex_style.backgroundColorPrimary, text_style.fontColorWhite] : btn_style.buttonDisabled, 
                {width: '100%'}
                ]}>{loadTranslations("saveMoney")}</Text>
              <Text style={[
                text_style.alignCenter,
                margin_styles.none, 
                flex_style.borderRadiusBottomCorners_xs,
                subType === "Y" ? [flex_style.backgroundColorPrimary, text_style.fontColorWhite] : btn_style.buttonDisabled,
                {width: '100%'}
                ]}>{loadTranslations("yearlyPerMonth")}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSubType("L");
            }}
            style={[
              btn_style.button,
              subType === "L" ? btn_style.buttonReversed : btn_style.buttonReversedDisabled,
              btn_style.borderWidth2,
              btn_style.buttonHalfWidth,
              btn_style.backgroundColorNone,
              margin_styles.vertical_space_md,
              padding_styles.noneVertical
            ]}
          >
            <Text style={[text_style.fontColorBlack]}>{loadTranslations("life")} </Text>
            <Text
              style={[
                text_style.primaryColor,
                text_style.bold,
                flex_style.width100,
                text_style.alignCenter,
                text_style.md
              ]}
            >99.95$ </Text>
            <Text>{loadTranslations("billedOnce")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onCheckout();
            }}
            style={[
              btn_style.button,
              btn_style.buttonFourFifthWidth,
              margin_styles.vertical_space_md,
            ]}
            disabled={subType === ""}
          >
            <Text style={[text_style.fontColorWhite]}>{subType === "L"? loadTranslations("payOnce") : loadTranslations("startFreeTrial")}</Text>
          </TouchableOpacity>
          <Text style={[text_style.xxs]}>{loadTranslations("cancelAnytime")}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  blueBackground: {
    backgroundColor: '#003362'
  },
  noMarginNoPadding: {
    margin: 0,
    padding: 0
  }

});
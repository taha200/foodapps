import React from "react";
import {
  View,
  Image,
  Platform,
  AppState,
  Linking,
} from "react-native";
import Assets from "../assets";
import { PermissionsAndroid } from "react-native";
import { getUserToken, getUserFCM } from "../utils/AsyncStorageHelper";
import { StackActions, NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { saveUserDetailsInRedux, saveUserFCMInRedux } from "../redux/actions/User";
import {
  ORDER_TYPE,
  NOTIFICATION_TYPE,
  DEFAULT_TYPE
} from "../utils/Constants";
import NavigationService from "../../NavigationService";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import { showValidationAlert, showDialogue } from "../utils/CMAlert";
import { isLocationEnable } from "../utils/LocationCheck";

var redirectType = "";

class InitialContainer extends React.Component {
  constructor(props) {
    super(props);

    this.userObj = undefined;
    redirectType = this.props.screenProps;
    this.isOpenSetting = false
  }

  state = {
    isRefresh: false,
    appState: AppState.currentState
  };

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    if (Platform.OS == "android") {
      LocationServicesDialogBox.stopListener(); // Stop the "locationProviderStatusChange" listener.
    }
  }

  _handleAppStateChange = (nextAppState) => {
    console.log("app state", nextAppState)
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')

      if (this.isOpenSetting == true) {
        console.log("get back result successs")
        this.checkLocationIOS()
      }
    }
    this.setState({ appState: nextAppState });
  }

  componentWillReceiveProps(prop) { }

  // async componentWillMount() {
  //   console.log("componentWillMount");
  //   LocationServicesDialogBox.checkLocationServicesIsEnabled({
  //     message:
  //       "<h2>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/>",
  //     ok: "YES",
  //     cancel: "NO",
  //     enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
  //     showDialog: true, // false => Opens the Location access page directly
  //     openLocationServices: true, // false => Directly catch method is called if location services are turned off
  //     preventOutSideTouch: false, //true => To prevent the location services popup from closing when it is clicked outside
  //     preventBackClick: false, //true => To prevent the location services popup from closing when it is clicked back button
  //     providerListener: true // true ==> Trigger "locationProviderStatusChange" listener when the location state changes
  //   })
  //     .then(success => {
  //       requestLocationPermission(this.props);
  //     })
  //     .catch(error => {
  //       showValidationAlert("Please allow location access from setting");
  //       console.log(error.message);
  //     });

  //   DeviceEventEmitter.addListener("locationProviderStatusChange", function(
  //     status
  //   ) {
  //     // only trigger when "providerListener" is enabled
  //     console.log(status); //  status => {enabled: false, status: "disabled"} or {enabled: true, status: "enabled"}
  //     if (status == "disabled") {
  //       showValidationAlert("Please allow location access from setting");
  //     }
  //   });
  // }

  async componentWillMount() {

    if (Platform.OS == "android") {
      isLocationEnable(
        success => {
          console.log("success");
          requestLocationPermission(this.props);
        },
        error => {
          console.log("error");
          showValidationAlert("Please allow location access from setting");
        },
        backPress => {
          console.log(backPress);
        }
      );
    } else {
      this.checkLocationIOS()
    }
  }

  checkLocationIOS() {
    navigator.geolocation.getCurrentPosition(() => {
      console.log("ios GRANTED")
      requestLocationPermission(this.props);
    },
      () => {
        console.log("ios DENIED")
        showDialogue("Please allow location access from setting", [{
          "text": "OK", onPress: () => {
            this.isOpenSetting = true
            Linking.openURL("app-settings:");
          }
        }])

      },
    )
  }


  render() {
    this.props.navigation.addListener("didFocus", payload => {
      if (redirectType == undefined) {
        redirectType = DEFAULT_TYPE;
        _checkData(this.props);
        // this.setState({ isRefresh: this.state.isRefresh ? false : true });
      }
    });

    return (
      <View style={{ flex: 1 }}>
        <Image
          source={Assets.bgHome}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%"
          }}
        />
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%"
          }}
        />
      </View>
    );
  }
}

export async function requestLocationPermission(prop) {
  if (Platform.OS == "ios") {
    _checkData(prop);
    return;
  }
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Eatance",
        message: "Allow Eatance to access your location "
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      _checkData(prop);
    } else {
    }
  } catch (err) {
    console.warn(err);
  }
}

export function _checkData(props) {
  setTimeout(() => {
    getUserToken(
      success => {
        if (
          success != undefined &&
          success.PhoneNumber != "" &&
          success.PhoneNumber != undefined
        ) {
          props.saveCredentials(success);

          if (redirectType === ORDER_TYPE) {
            redirectType = undefined;

            NavigationService.navigate("Order");
          } else if (redirectType === NOTIFICATION_TYPE) {
            redirectType = undefined;

            NavigationService.navigate("Notification");
          } else {

            getUserFCM(
              success => {
                props.saveToken(success)
                props.navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    actions: [
                      //       NavigationActions.navigate({ routeName: "MainContainer" })
                      NavigationActions.navigate({ routeName: "MainContainer" })
                    ]
                  })
                );
              },
              failure => {

              }
            )
            
          }
        } else {
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: "SplashContainer" })
              ]
            })
          );
        }
      },
      failure => {
        props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: "SplashContainer" })
            ]
          })
        );
      }
    );

    if (
      this.userObj != undefined &&
      this.userObj.PhoneNumber != "" &&
      this.userObj.PhoneNumber != undefined
    ) {
    } else {
    }
  }, 3000);
}

export default connect(
  state => {
    return {};
  },
  dispatch => {
    return {
      saveCredentials: detailToSave => {
        dispatch(saveUserDetailsInRedux(detailToSave));
      },
      saveToken: token => {
        dispatch(saveUserFCMInRedux(token))
      }
    };
  }
)(InitialContainer);

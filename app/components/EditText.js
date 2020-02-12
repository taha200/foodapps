import React from "react";
import {
  View,
  Text,
  Animated,
  Image,
  StyleSheet,
  TextInput
} from "react-native";
import { EDColors } from "../assets/Colors";

export default class EditText extends React.Component {
  render() {
    return (
     
      <TextInput
        style={[style.editText] || {}}
        keyboardType={this.props.keyboardType}
        secureTextEntry={this.props.secureTextEntry}
        maxLength={
          this.props.maxLength != undefined ? this.props.maxLength : 30
        }
        multiline={
          this.props.multiline != undefined ? this.props.multiline : false
        }
        onChangeText={userText => {
          if (this.props.onChangeText != undefined) {
            this.props.onChangeText(userText);
          }
        }}
        
        value={this.props.value}
        placeholder={this.props.hint}
        returnKeyType="done"
      />
    );
  }
}

export const style = StyleSheet.create({
  editText: {
    backgroundColor: "#fff",
    borderBottomColor: EDColors.primary,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 0,
    marginTop: 10,
    padding: 10,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1
    // boxshadow: 10 5 5 black;
  }
});

import React, { useEffect } from "react";
import { Image, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cpfMask } from "../../utils/mask";

import { LoginButton } from "../../components/Buttons";
import { LoginText } from "../../components/Texts";
import { InputText } from "../../components/Inputs";

export const LoginPage = ({ navigation }) => {
  const [cpf, setCpf] = React.useState("");
  const [senha, setSenha] = React.useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      navigation.navigate("Dashboard");
    }
  }

  const handlerCpf = (e) => {
    if (e.length <= 14) {
      setCpf(cpfMask(e));
    }
  };

  const handlerSenha = (e) => {
    setSenha(e);
  };

  const handleLogin = async () => {
    const matricula = cpf.replace(/[^0-9]/g, "");

    if (matricula.length < 11) {
      alert("CPF inválido");
      return;
    }

    if (senha.length == 0) {
      alert("Senha Vazia");
      return;
    }

    fetch("http://31.220.58.21:8000/api/auth/login/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        matricula: matricula,
        password: senha,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.token) {
          setCpf("");
          setSenha("");
          if (response.usuario.funcao == 0) {
            alert("Esta aplicacao e apenas para Motoristas");
          } else {
            AsyncStorage.setItem("user", JSON.stringify(response)).then(() => {
              AsyncStorage.setItem("sync", "true").then(() => {
                navigation.navigate("Dashboard");
              });
            });
          }
        } else {
          alert("CPF ou senha incorretas");
        }
      })
      .catch((error) => {
        alert("Erro ao efetuar login!");
      });
  };

  return (
    <View style={Style().container}>
      <Image source={require("../../assets/images/real-turismo.png")}></Image>
      <InputText
        placeholder="CPF"
        value={cpf}
        onChangeText={(e) => {
          handlerCpf(e);
        }}
        keyboardType="number-pad"
      ></InputText>
      <InputText
        placeholder="Senha"
        value={senha}
        onChangeText={(e) => {
          handlerSenha(e);
        }}
        secureTextEntry={true}
      ></InputText>
      <LoginButton onPress={handleLogin}>
        <LoginText>Entrar</LoginText>
      </LoginButton>
    </View>
  );
};

const Style = () => {
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 20,
      // Paddings to handle safe area
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  });

  return styles;
};
export default LoginPage;

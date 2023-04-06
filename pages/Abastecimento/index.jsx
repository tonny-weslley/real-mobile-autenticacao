import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  BackHandler,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoginButton } from "../../components/Buttons";
import { LoginText, LabelText } from "../../components/Texts";

import { useIsFocused } from "@react-navigation/native";

import Spinner from "react-native-loading-spinner-overlay";

import {
  FormBody,
  LogoutButton,
  BackSection,
  InputContainer,
} from "../../components/Containers";

import { numericMask, arimeticaMask } from "../../utils/mask";

import SelectDropdown from "react-native-select-dropdown";

export const AbastecimentoPage = ({ navigation }) => {
  const [postos, setPostos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [veiculosArray, setVeiculosArray] = useState([]);
  const isFocused = useIsFocused();
  const [postosArray, setPostosArray] = useState([]);
  const [veiculo, setVeiculo] = useState("");
  const [posto, setPosto] = useState("");
  const [loading, setLoading] = useState(false);
  const tiposCombustiveis = ["Gasolina", "Etanol", "Diesel", "GNV", "S10"];
  const [combustivel, setCombustivel] = useState("");
  const [hodometro, setHodometro] = useState("");
  const [valorLitro, setValorLitro] = useState("");
  const [valor, setValor] = useState("");
  const data = new Date();
  const [abastecimento, setAbastecimento] = useState([]);
  const [timeover, setTimeover] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [user, setUser] = useState({
    token: "",
    usuario: {
      nome: "",
      matricula: "",
      id_funcionario: "",
      funcao: "",
    },
  });

  useEffect(() => {
    setTimeover(false);
    setEnviado(false);
  }, [isFocused]);

  useEffect(() => {
    loadUser();
    const backAction = () => {
      Alert.alert(
        "Calma ai",
        "Tem certeza que deseja cancelar o abastecimento",
        [
          {
            text: "Continuar abastecendo",
            onPress: () => null,
            style: "cancel",
          },
          {
            text: "Voltar para o inicio",
            onPress: () => navigation.navigate("Dashboard"),
          },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!timeover) return;

    if (!enviado) {
      const hodometro_new = hodometro
        .replace(".", "")
        .replace("Km", "")
        .replace(" ", "");
      const valor_abastecido = parseFloat(
        valor
          .replace("R$", "")
          .replace(".", "")
          .replace(" ", "")
          .replace(",", ".")
      ).toFixed(2);
      const valor_combustivel_new = parseFloat(
        valorLitro
          .replace("R$", "")
          .replace(".", "")
          .replace(" ", "")
          .replace(",", ".")
      ).toFixed(2);

      const litros_abastecido = (
        valor_abastecido / valor_combustivel_new
      ).toFixed(2);

      const data_new = new Date();

      const abastecimentoOFF = {
        id: data_new.getTime(),
        data: data_new,
        hodometro: hodometro_new,
        valor_combustivel: valor_combustivel_new,
        valor_abastecido: valor_abastecido,
        litros_abastecido: litros_abastecido,
        tipo_combustivel: combustivel,
        posto: posto.id,
        veiculo: veiculo.id,
        placa: veiculo.placa,
        motorista: user.usuario.id_funcionario,
        status: 0,
      };
      let aux = [];
      aux.push(abastecimentoOFF);
      AsyncStorage.getItem("abastecimentos").then((abastecimentos) => {
        if (abastecimentos) {
          let abastecimentosOFF = JSON.parse(abastecimentos);
          AsyncStorage.removeItem("abastecimentos").then(() => {
            if (abastecimentosOFF.length < 3) {
              abastecimentosOFF.forEach((abastecimento) => {
                aux.push(abastecimento);
              });
              AsyncStorage.setItem(
                "abastecimentos",
                JSON.stringify(aux)
              ).then(() => {
                AsyncStorage.removeItem("sync").then(() => {
                  AsyncStorage.setItem("sync", "false").then(() => {
                    setLoading(false);
                    navigation.navigate("Dashboard");
                  });
                });
              });

            } else {
              abastecimentosOFF.forEach((abastecimento) => {
                if (aux.length != 3) {
                  aux.push(abastecimento);
                } else {
                  AsyncStorage.setItem(
                    "abastecimentos",
                    JSON.stringify(aux)
                  ).then(() => {
                    AsyncStorage.removeItem("sync").then(() => {
                      AsyncStorage.setItem("sync", "false").then(() => {
                        setLoading(false);
                        navigation.navigate("Dashboard");
                      });
                    });
                  });
                }
              });
            }
          });
        } else {
          AsyncStorage.setItem("abastecimentos", JSON.stringify(aux)).then(
            () => {
              AsyncStorage.removeItem("sync").then(() => {
                AsyncStorage.setItem("sync", "false").then(() => {
                  setLoading(false);
                  navigation.navigate("Dashboard");
                });
              });
            }
          );
        }
      });
    }
  }, [timeover]);

  useEffect(() => {
    if (user.token == "") return;
    LoadLocalPostos();
    LoadLocalVeiculos();
    LoadPostos();
    LoadVeiculos();
  }, [user]);

  useEffect(() => {
    if (veiculos.length == 0 || postos.length == 0) return;
    let array = [];
    veiculos.forEach((veiculo) => {
      array.push(
        veiculo.codigo + " - " + veiculo.modelo + " - " + veiculo.placa
      );
    });
    setVeiculosArray(array);

    array = [];
    postos.forEach((posto) => {
      array.push(posto.nome);
    });
    setPostosArray(array);

    setLoading(false);
  }, [postos, veiculos]);

  async function loadUser() {
    AsyncStorage.getItem("user").then((user) => {
      if (user) {
        setUser(JSON.parse(user));
      } else {
        navigation.navigate("Login");
      }
    });
  }

  async function LoadLocalPostos() {
    AsyncStorage.getItem("postos").then((postos) => {
      if (postos != null) {
        setPostos(JSON.parse(postos));
      }
    });
  }

  async function LoadLocalVeiculos() {
    AsyncStorage.getItem("veiculos").then((veiculos) => {
      if (veiculos != null) {
        setVeiculos(JSON.parse(veiculos));
      }
    });
  }

  async function LoadPostos() {
    const page = 1;

    let postos_loading = [];

    async function loadPostos(page) {
      fetch(`http://31.220.58.20:8000/api/postos/?page=${page}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${user?.token}`,
        },
      }).then((response) => {
        if (response.status == 200) {
          response.json().then((data) => {
            if (data.results.length > 0) {
              data.results.forEach((posto) => {
                postos_loading.push(posto);
              });
            }
            if (data.next != null) {
              loadPostos(page + 1);
            } else {
              AsyncStorage.removeItem("postos").then(() => {
                AsyncStorage.setItem("postos", JSON.stringify(postos_loading));
                setPostos(postos_loading);
              });
            }
          });
        } else {
          AsyncStorage.getItem("postos").then((postos) => {
            if (postos != null) {
              setPostos(JSON.parse(postos));
            }
          });
        }
      });
    }

    loadPostos(page);
  }

  async function LoadVeiculos() {
    const page = 1;

    let veiculos = [];

    async function loadVeiculos(page) {
      fetch(`http://31.220.58.20:8000/api/veiculos/?page=${page}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${user?.token}`,
        },
      }).then((response) => {
        if (response.status == 200) {
          response.json().then((data) => {
            if (data.results.length > 0) {
              data.results.forEach((veiculo) => {
                veiculos.push(veiculo);
              });
            }
            if (data.next != null) {
              loadVeiculos(page + 1);
            } else {
              AsyncStorage.removeItem("veiculos").then(() => {
                AsyncStorage.setItem("veiculos", JSON.stringify(veiculos));
                setVeiculos(veiculos);
              });
            }
          });
        } else {
          //carregar veiculos do storage
          AsyncStorage.getItem("veiculos").then((veiculos) => {
            if (veiculos != null) {
              setVeiculos(JSON.parse(veiculos));
            }
          });
        }
      });
    }
    loadVeiculos(page);
  }

  async function handleAbastecer() {
    if (
      (veiculo == null || posto == null || valor == "",
      valorLitro == "" || hodometro == "" || combustivel == "")
    ) {
      Alert.alert("Atenção", "Preencha todos os campos");
      return;
    }

    setTimeout(() => {
      setTimeover(true);
    }, 5000);

    const hodometro_new = parseInt(hodometro
      .replace(".", "")
      .replace("Km", "")
      .replace(" ", ""));
    const valor_abastecido = parseFloat(
      valor
        .replace("R$", "")
        .replace(".", "")
        .replace(" ", "")
        .replace(",", ".")
    ).toFixed(2);
    const valor_combustivel_new = parseFloat(
      valorLitro
        .replace("R$", "")
        .replace(".", "")
        .replace(" ", "")
        .replace(",", ".")
    ).toFixed(2);

    const litros_abastecido = (
      valor_abastecido / valor_combustivel_new
    ).toFixed(2);

    const data_new = new Date();

    const abastecimentoregistrado = {
      data: data_new,
      hodometro: hodometro_new,
      valor_combustivel: valor_combustivel_new,
      valor_abastecido: valor_abastecido,
      litros_abastecido: litros_abastecido,
      tipo_combustivel: combustivel,
      posto: posto.id,
      motorista: user.usuario.id_funcionario,
      veiculo: veiculo.id
    };

    setLoading(true);

    fetch("http://31.220.58.20:8000/api/abastecimentos/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Token ${user.token}`,
      },
      body: JSON.stringify(abastecimentoregistrado),
    }).then((response) => {
      if (response.status == 201) {
        setEnviado(true);
        navigation.navigate("Dashboard");
      }
      setLoading(false);
    });
  }

  return (
    <View style={Style().container}>
      <BackSection>
        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
          <LogoutButton source={require("../../assets/icons/back.png")} />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "normal" }}>
          Voltar para a Tela Inicial
        </Text>
      </BackSection>
      <FormBody>
        <Image
          source={
            veiculo.tipo == 0
              ? require("../../assets/icons/carro.png")
              : veiculo.tipo == 1
              ? require("../../assets/icons/van.png")
              : veiculo.tipo == 2
              ? require("../../assets/icons/onibus.png")
              : veiculo.tipo == 3
              ? require("../../assets/icons/moto.png")
              : require("../../assets/icons/condutor.png")
          }
          style={{ width: "20%", height: "10%", resizeMode: "contain" }}
        />

        <SelectDropdown
          buttonStyle={{
            backgroundColor: "red",
            width: "65%",
            height: "6%",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            elevation: 5,
            marginBottom: "8%",
          }}
          buttonTextStyle={{ color: "#fff" }}
          defaultButtonText="selecione um veiculo"
          search={true}
          data={veiculosArray}
          onSelect={(selectedItem, index) => {
            setVeiculo(veiculos[index]);
          }}
        />

        <SelectDropdown
          buttonStyle={{
            backgroundColor: "#B2B2B2",
            width: "80%",
            height: "6%",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            elevation: 5,
          }}
          buttonTextStyle={{ color: "#fff" }}
          defaultButtonText="Selecione um posto"
          search={true}
          data={postosArray}
          onSelect={(selectedItem, index) => {
            setPosto(postos[index]);
          }}
        />

        <SelectDropdown
          buttonStyle={{
            backgroundColor: "#B2B2B2",
            width: "80%",
            height: "6%",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            elevation: 5,
            marginBottom: "8%",
          }}
          buttonTextStyle={{ color: "#fff" }}
          defaultButtonText="Tipo de Combustivel"
          data={tiposCombustiveis}
          onSelect={(selectedItem, index) => {
            setCombustivel(selectedItem);
          }}
        />

        <TextInput
          style={{
            width: "80%",
            height: "8%",
            borderRadius: 10,
            backgroundColor: "#fff",
            paddingLeft: 20,
            elevation: 5,
            fontSize: 20,
          }}
          variant="filled"
          placeholder="Hodometro"
          placeholderTextColor="red"
          keyboardType="numeric"
          value={hodometro}
          onChangeText={(text) => setHodometro(numericMask(text))}
        />

        <TextInput
          style={{
            width: "80%",
            height: "8%",
            borderRadius: 10,
            backgroundColor: "#fff",
            paddingLeft: 20,
            elevation: 5,
            fontSize: 20,
          }}
          placeholder="Valor do litro"
          placeholderTextColor="red"
          keyboardType="numeric"
          value={valorLitro}
          onChangeText={(text) => setValorLitro(arimeticaMask(text))}
        />

        <TextInput
          style={{
            width: "80%",
            height: "8%",
            borderRadius: 10,
            backgroundColor: "#fff",
            paddingLeft: 20,
            shadowColor: "#000",
            elevation: 5,
            fontSize: 20,
            marginBottom: "8%",
          }}
          placeholder="Valor do abastecimento"
          placeholderTextColor="red"
          keyboardType="numeric"
          value={valor}
          onChangeText={(text) => setValor(arimeticaMask(text))}
        />

        <LoginButton onPress={handleAbastecer} style={{ elevation: 5 }}>
          <LoginText>Cadastar</LoginText>
        </LoginButton>
      </FormBody>

      <Spinner visible={loading} />
    </View>
  );
};

const Style = () => {
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      // Paddings to handle safe area
      flex: 1,
      backgroundColor: "red",
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  });

  return styles;
};

export default AbastecimentoPage;

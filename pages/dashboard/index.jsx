import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  FlatList,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIsFocused } from "@react-navigation/native";

import {
  Header,
  DashBody,
  LogoutSection,
  LogoutButton,
  WellcomeSection,
  AbastecerButton,
} from "../../components/Containers";

import AbastecimentoCard from "../../components/abastecimentoCard";

export const DashboardPage = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [user, setUser] = React.useState({
    token: "",
    usuario: {
      nome: "",
      matricula: "",
      id_funcionario: "",
      funcao: "",
    },
  });
  const [abastecimentos, setAbastecimentos] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [veiculos, setVeiculos] = React.useState([]);
  const [atualizando, setAtualizando] = React.useState(false);
  const [isSync, setSync] = React.useState(false);

  useEffect(() => {
    loadUser();
    verifySync().then(() => {
      LoadLocalVeiculos();
      LoadLocalAbastecimentos();
    });

    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (user.token == "") return;
    verifySync().then(() => {
      LoadPostos();
      LoadVeiculos();
    });
  }, [user]);

  useEffect(() => {
    if (refreshing == false) return;
    setAtualizando(false);
    verifySync().then(() => {
      sendLocalAbastecimentos().then(() => {
        LoadLocalAbastecimentos().then(() => {
          LoadAbastecimentos();
        });
      });
      LoadPostos();
      LoadVeiculos();
    });
  }, [refreshing]);

  useEffect(() => {
    if (isFocused == false) return;
    setAtualizando(false);
    verifySync().then(() => {
      sendLocalAbastecimentos().then(() => {
        LoadLocalAbastecimentos().then(() => {
          LoadAbastecimentos();
        });
      });
      LoadPostos();
      LoadVeiculos();
    });
  }, [isFocused]);

  useEffect(() => {
    if (abastecimentos.length == 0) return;
    AsyncStorage.setItem("abastecimentos", JSON.stringify(abastecimentos));
  }, [abastecimentos]);

  async function verifySync() {
    AsyncStorage.getItem("sync").then((sync) => {
      if (sync) {
        setSync(JSON.parse(sync));
      }
    });
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  async function loadUser() {
    await AsyncStorage.getItem("user").then((user) => {
      if (user) {
        setUser(JSON.parse(user));
      } else {
        navigation.navigate("Login");
      }
    });
  }

  async function handleLogout() {
    await AsyncStorage.removeItem("user").then(() => {
      navigation.navigate("Login");
    });
  }

  async function LoadLocalAbastecimentos() {
    await AsyncStorage.getItem("abastecimentos").then((abastecimentos) => {
      if (abastecimentos) {
        setAbastecimentos(JSON.parse(abastecimentos));
      }
    });
  }
  async function LoadPostos() {
    const page = 1;

    let postos = [];

    async function loadPostos(page) {
      fetch(`http://31.220.58.21:8000/api/postos/?page=${page}`, {
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
                postos.push(posto);
              });
            }
            if (data.next != null) {
              loadPostos(page + 1);
            } else {
              AsyncStorage.removeItem("postos").then(() => {
                AsyncStorage.setItem("postos", JSON.stringify(postos));
              });
            }
          });
        } else {
        }
      });
    }

    loadPostos(page);
  }

  async function LoadVeiculos() {
    const page = 1;

    let veiculos = [];

    async function loadVeiculos(page) {
      fetch(`http://31.220.58.21:8000/api/veiculos/?page=${page}`, {
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

  async function LoadLocalVeiculos() {
    AsyncStorage.getItem("veiculos").then((veiculos) => {
      if (veiculos != null) {
        setVeiculos(JSON.parse(veiculos));
      }
    });
  }

  async function LoadAbastecimentos() {
    AsyncStorage.getItem("sync").then((isSyncked) => {
      if (isSyncked == "true") {

        let abastecimentos_loading = [];

        fetch(
          `http://31.220.58.21:8000/api/funcionarios/${user.usuario.id_funcionario}/ultimos_abastecimentos/`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${user?.token}`,
            },
          }
        ).then((response) => {
          if (response.status == 200) {
            response.json().then((data) => {
              data.forEach((abastecimento) => {
                if (abastecimentos_loading.length != 3) {
                  abastecimento.placa = veiculos.find(
                    (item) => item.id == abastecimento.veiculo
                  ).placa;
                  if (abastecimento.EValidado) {
                    abastecimento.status = 2;
                  } else {
                    abastecimento.status = 1;
                  }
                  abastecimentos_loading.push(abastecimento);
                }
              });

              AsyncStorage.removeItem("abastecimentos").then(() => {
                setAbastecimentos(abastecimentos_loading);
              });
            });
          }
        });
      }
    });
  }

  function handleAbastecer() {
    AsyncStorage.getItem("sync").then((isSyncked) => {
      if (isSyncked == "true") {
        navigation.navigate("Abastecimento");
      } else {
        Alert.alert(
          "Sincronização",
          "Você precisa sincronizar seus dados antes de abastecer"
        );
      }
    });
  }

  async function sendLocalAbastecimentos() {
    AsyncStorage.getItem("sync").then((isSyncked) => {
      if (isSyncked == "false") {
        if (atualizando == true) {
          return;
        }
        setAtualizando(true);
        AsyncStorage.getItem("abastecimentos").then((abastecimentos) => {
          const abastecimentos_local = JSON.parse(abastecimentos);
          if (abastecimentos_local) {
            abastecimentos_local.forEach((abastecimento) => {
              if (abastecimento.status == 0) {
                abastecimento.hodometro = parseInt(abastecimento.hodometro);
                fetch("http://31.220.58.21:8000/api/abastecimentos/", {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Token ${user.token}`,
                  },
                  body: JSON.stringify(abastecimento),
                }).then((response) => {
                  if (response.status == 201) {
                    AsyncStorage.removeItem("sync").then(() => {
                      AsyncStorage.setItem("sync", "true").then(() => {
                        Alert.alert(
                          "Abastecimentos Offline enviados com sucesso",
                          "Atualize a página para ver os abastecimentos enviados"
                        );
                        setAtualizando(false);
                      });
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  return (
    <View style={Style().container}>
      <Header>
        <LogoutSection>
          <TouchableOpacity onPress={handleLogout}>
            <LogoutButton source={require("../../assets/icons/logout.png")} />
          </TouchableOpacity>
        </LogoutSection>

        <WellcomeSection>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "normal" }}>
            Bem vindo
          </Text>
          <Text style={{ color: "#fff", fontSize: 30, fontWeight: "normal" }}>
            {user?.usuario.nome} {user?.usuario.sobrenome}
          </Text>
        </WellcomeSection>

        <AbastecerButton onPress={handleAbastecer}>
          <Text
            style={{ color: "#fd0008", fontSize: 15, fontWeight: "normal" }}
          >
            Abastecer
          </Text>
        </AbastecerButton>
      </Header>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={Style().scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text
          style={{
            fontSize: 22,
            marginTop: 15,
            marginLeft: 10,
            backgroundColor: "#fff",
          }}
        >
          {" "}
          Ultimos Abastecimentos
        </Text>
        <DashBody style={{}}>
          <FlatList
            style={{ width: "100%" }}
            data={abastecimentos}
            keyExtractor={(abastecimento) => String(abastecimento.id)}
            renderItem={({ item: abastecimento }) => (
              <AbastecimentoCard abastecimento={abastecimento} />
            )}
          />
        </DashBody>
      </ScrollView>
    </View>
  );
};

const Style = () => {
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      // Paddings to handle safe area
      flex: 1,
      alignContent: "center",
      justifyContent: "center",
      width: "100%",
      backgroundColor: "#fd0008",
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },

    scrollView: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      width: "100%",
      height: "100%",
      backgroundColor: "#fff",
    },
  });

  return styles;
};

export default DashboardPage;

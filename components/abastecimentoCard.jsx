import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export const AbastecimentoCard = ({ abastecimento }) => {
  const data = new Date(abastecimento.data);

  const dia = data.getDate().toString().padStart(2, "0");
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const ano = data.getFullYear().toString().slice(2);

  const dataFormatada = `${dia}/${mes}/${ano}`;

  return (
    <View style={
        {
            flex: 2,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fefefe",
            padding: "3%",
            marginVertical: '3%',
            marginHorizontal: 'auto',
            marginLeft: '0.3%',
            borderRadius: 10,
            width: "99%",
            elevation: 5,

        }
    }>
      <View style={{  flexDirection: "column", alignItems: "flex-start" }}>
        <Text style={{ color: "#000", fontSize: 20, fontWeight: "normal" }}>
          Placa: {abastecimento.placa}
        </Text>
        <Text style={{ color: 'grey'}}>
          {dataFormatada}
        </Text>
        <Text style={{ color: 'grey'}}>{abastecimento.km_rodado}Km</Text>
        <Text style={{ color: "red", fontSize: 20, fontWeight: "normal" }}>
          R$ {abastecimento.valor_abastecido}
        </Text>
      </View>
      <View style={{flex:2, alignItems:'flex-end', width:'100%', marginRight: '3%'}}>
        <Image
          style={{ resizeMode: 'contain'}}
          source={
            abastecimento.status == 0
              ? require("../assets/icons/no-sync.png")
              : abastecimento.status == 1
              ? require("../assets/icons/sync.png")
              : require("../assets/icons/valid.png")
          }
        />
      </View>
    </View>
  );
};

export default AbastecimentoCard;

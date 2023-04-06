import styled from "styled-components/native";

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export const Header = styled.View`
  background-color: red;
  width: 100%;
`;

export const DashBody = styled.View`
  display: flex;
  height: 100%;
  width: 90%;
  padding: 0;
  margin: 0 auto;
  background-color: #fff;
  align-items: center;
  justify-content: center;
`;

export const FormBody = styled.View`
  padding: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 93%;
  background-color: #fff;
  display: flex;
  margin: 0 auto;
  align-items: center;
  justify-content: space-between;
  padding: 5% 0;
`;

export const LogoutSection = styled.View`
  display: flex
  justifyContent: flex-end;
  alignItems: flex-end;
  padding: 4% 8% 0 8%;
  width: 100%;

`;

export const LogoutButton = styled.Image`
  width: 28px;
  height: 25px;
`;

export const WellcomeSection = styled.View`
  display: flex;
  alignItems: center;
  justifyContent: center;
`;

export const AbastecerButton = styled.TouchableOpacity`
  backgroundColor: #ffffff;
  padding: 3% 6% 3% 6%;
  borderRadius: 5px;
  display: flex;
  alignItems: center;
  justifyContent: center;
  width: 60%;
  margin: 4% auto;
`;

export const BackSection = styled.View`
  width: 100%;
  height: 7%;
  backgroundColor: red;
  display: flex;
  padding: 0 3%;
  flexDirection: row;
  alignItems: center;
  gap: 10px;
`;

export const InputContainer = styled.View`
  alignitems: center;
`;
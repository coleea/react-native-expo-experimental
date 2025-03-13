import React, { useRef, useState } from "react";
import { View, Button, Text, Alert } from "react-native";
import { WebView } from "react-native-webview";

export const MyWebView = () => {
  const webViewRef = useRef<WebView>(null!);
  const [message, setMessage] = useState("");

  // 웹뷰에서 네이티브로 메시지를 받았을 때 처리하는 함수
  const onMessage = (event: any) => {
    try {
		console.log('event');
		console.log(event);

      const data = JSON.parse(event.nativeEvent.data);

      // 웹뷰에서 보낸 메시지 타입에 따라 다른 네이티브 기능 실행
      console.log("data.type");
      console.log(data.type);

	  if(data.action === "getDeviceInfo") {
		console.log('getDeviceInfo 정보를 웹브라우저에 postMessage');
		console.log();
		// https://stackoverflow.com/questions/68334181/how-to-use-postmessage-in-a-react-native-webview

		// deprecated
		// webViewRef.current.postMessage(JSON.stringify(data)); // 데이터를 JSON 문자열로 변환하여 전송

		webViewRef.current.injectJavaScript(
			`window.postMessage(
			  {
				reply: 'reply'
			  }
			);`
		  )

		return;
	  }

      switch (data.type) {
        case "getDeviceInfo":
          webViewRef.current.postMessage(JSON.stringify(data)); // 데이터를 JSON 문자열로 변환하여 전송

          break;
        case "shareContent":
          shareContent(data.content);
          break;
        case "saveData":
          saveToStorage(data.key, data.value);
          break;
        case "getUserInfo":
          getUserInfo(data.userId);
          break;
        case "scanQRCode":
          scanQRCode();
          break;
        default:
          console.log("알 수 없는 메시지 타입:", data.type);
      }

      setMessage(`웹뷰로부터 받은 메시지: ${event.nativeEvent.data}`);
    } catch (error) {
      console.error("메시지 처리 중 오류 발생:", error);
    }
  };

  // 네이티브 기능: 컨텐츠 공유
  const shareContent = (content: any) => {
    console.log(`공유 기능 실행: ${content}`);
    // 실제로는 여기서 React Native의 Share API를 사용
    // import { Share } from 'react-native';
    // Share.share({ message: content });

    // 웹뷰로 결과 전송
    sendToWebView({ type: "shareResult", success: true });
  };

  // 네이티브 기능: 데이터 저장
  const saveToStorage = (key: any, value: any) => {
    console.log(`데이터 저장: ${key} = ${value}`);
    // AsyncStorage 등을 사용해 저장
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // AsyncStorage.setItem(key, value);

    sendToWebView({ type: "saveResult", success: true, key });
  };

  // 네이티브 기능: 사용자 정보 가져오기
  const getUserInfo = (userId: any) => {
    // 실제로는 로컬 저장소나 API를 통해 사용자 정보를 가져옴
    const userInfo = {
      id: userId || "12345",
      name: "홍길동",
      email: "user@example.com",
    };

    sendToWebView({ type: "userInfoResult", success: true, data: userInfo });
  };

  // 네이티브 기능: QR 코드 스캔
  const scanQRCode = () => {
    // 실제로는 카메라 API와 QR 스캔 라이브러리 사용
    // 여기서는 시뮬레이션으로 결과 리턴
    setTimeout(() => {
      sendToWebView({
        type: "qrCodeResult",
        success: true,
        data: "https://example.com/product/12345",
      });
    }, 1000);
  };

  // 네이티브에서 웹뷰로 메시지 전송
  const sendToWebView = (data: any) => {
    if (webViewRef.current) {
      const messageString = JSON.stringify(data);
      webViewRef.current.injectJavaScript(`
        if (window.receiveFromNative && typeof window.receiveFromNative === 'function') {
          window.receiveFromNative(${messageString});
        } else {
          // 대체 메커니즘: 이벤트 방식으로 전달
          const event = new CustomEvent('nativeMessage', { 
            detail: ${messageString}
          });
          document.dispatchEvent(event);
        }
        true;
      `);
    }
  };

  // 웹뷰 로드 완료 핸들러
  const handleWebViewLoad = () => {
    console.log("WebView 로딩 완료");
    // 필요시 웹뷰 로드 완료 후 초기 데이터 전송
    sendToWebView({
      type: "initData",
      platform: "react-native",
      deviceInfo: {
        os: "Android", // 실제로는 Platform.OS 등을 사용하여 동적으로 설정
        version: "14",
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{
          //   baseUrl: "https://next-test-for-webview.vercel.app/test",
          uri: "https://next-test-for-webview.vercel.app/test",
        }} // 외부 웹앱 URL
        // 또는 로컬 HTML 파일: source={require('./assets/index.html')}
        onMessage={onMessage}
        onLoad={handleWebViewLoad}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
      />
      <View style={{ padding: 10, backgroundColor: "#f5f5f5" }}>
        <Text style={{ marginBottom: 10 }}>{message}</Text>
        <Button
          title="사용자 정보 보내기"
          onPress={() =>
            sendToWebView({
              type: "userProfile",
              data: { name: "홍길동", role: "admin" },
            })
          }
        />
      </View>
    </View>
  );
};

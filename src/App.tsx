import { useEffect } from "react";
import Router from "./routes/Routes.tsx";
import { useFavoriteStore } from "./store/favoriteStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const loadFavorites = useFavoriteStore((s) => s.loadFavorites);

  useEffect(() => {
    loadFavorites();   
  }, [loadFavorites]);

  useEffect(() => {
    // 실제 서비스에서는 로그인한 사용자 ID를 환경변수나 Store에서 가져와야 합니다.
    const userId = 1; 
    const socket = new WebSocket(`ws://localhost:8000/ws?userId=${userId}`);

    socket.onopen = () => {
      console.log("[WS] 서버에 연결되었습니다.");
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // PRICE_ALERT 타입의 메시지만 처리
        if (msg.type === "PRICE_ALERT") {
          const { stockName, targetPrice, alertType } = msg;
          
          // 알림 팝업 띄우기
          const alertMessage = `[${alertType === 'UPPER' ? '상한' : '하한'} 도달] ${stockName}이(가) ${Number(targetPrice).toLocaleString()}원에 도달했습니다!`;
          
          if (alertType === 'UPPER') {
            toast.error(alertMessage, { position: "top-right", autoClose: 5000 });
          } else {
            toast.info(alertMessage, { position: "top-right", autoClose: 5000 });
          }
        }
      } catch (error) {
        console.error("[WS] 알림 수신 에러:", error);
      }
    };

    socket.onclose = () => {
      console.log("[WS] 서버와 연결이 종료되었습니다. 재연결을 시도합니다...");
      // 필요 시 재연결 로직 추가 가능
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <>
      <Router />
      {/* 알림이 화면 어디에 뜰지 설정하는 컨테이너 */}
      <ToastContainer 
        theme="dark"
        pauseOnFocusLoss={false}
        limit={3}
      />
    </>
  );
}

export default App;
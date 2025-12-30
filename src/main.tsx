import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import {WebSocketProvider} from "./context/WebSocketContext.tsx";

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(
        <WebSocketProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
        </WebSocketProvider>
);

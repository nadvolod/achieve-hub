
import './index.css';

console.log('Main.tsx is loading...');

const root = document.getElementById('root');
if (root) {
  root.innerHTML = '<h1 style="padding: 20px;">React is working now!</h1>';
  console.log('React mounted successfully');
} else {
  console.error('Root element not found');
}

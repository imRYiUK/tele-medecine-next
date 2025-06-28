const io = require('socket.io-client');

// Configuration
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';
const TEST_TOKEN = process.env.TEST_JWT_TOKEN || 'your-test-jwt-token';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test WebSocket connections
async function testWebSocketConnections() {
  log('🧪 Testing WebSocket Connections...', 'blue');
  log(`WebSocket URL: ${WEBSOCKET_URL}`, 'yellow');
  
  // Test 1: Notifications WebSocket
  log('\n📢 Testing Notifications WebSocket...', 'blue');
  await testNotificationsWebSocket();
  
  // Test 2: Chat WebSocket
  log('\n💬 Testing Chat WebSocket...', 'blue');
  await testChatWebSocket();
  
  log('\n✅ WebSocket testing completed!', 'green');
}

async function testNotificationsWebSocket() {
  return new Promise((resolve) => {
    const socket = io(WEBSOCKET_URL, {
      auth: { token: TEST_TOKEN },
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    let connected = false;
    let notificationReceived = false;

    // Connection events
    socket.on('connect', () => {
      log('✅ Connected to notifications WebSocket', 'green');
      connected = true;
    });

    socket.on('disconnect', (reason) => {
      log(`❌ Disconnected from notifications: ${reason}`, 'red');
    });

    socket.on('connect_error', (error) => {
      log(`❌ Connection error: ${error.message}`, 'red');
    });

    // Notification events
    socket.on('notification', (notification) => {
      log('📨 Received notification:', 'green');
      console.log(JSON.stringify(notification, null, 2));
      notificationReceived = true;
    });

    socket.on('notification_read', (data) => {
      log('✅ Notification read confirmation received', 'green');
    });

    socket.on('error', (error) => {
      log(`❌ Notification error: ${error.message}`, 'red');
    });

    // Test completion
    setTimeout(() => {
      if (connected) {
        log('✅ Notifications WebSocket test passed', 'green');
      } else {
        log('❌ Notifications WebSocket test failed', 'red');
      }
      socket.disconnect();
      resolve();
    }, 5000);
  });
}

async function testChatWebSocket() {
  return new Promise((resolve) => {
    const socket = io(`${WEBSOCKET_URL}/chat`, {
      auth: { token: TEST_TOKEN },
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    let connected = false;
    let joinedRoom = false;

    // Connection events
    socket.on('connect', () => {
      log('✅ Connected to chat WebSocket', 'green');
      connected = true;
      
      // Test joining a room
      socket.emit('joinImageRoom', { imageID: 'test-image-123' });
    });

    socket.on('disconnect', (reason) => {
      log(`❌ Disconnected from chat: ${reason}`, 'red');
    });

    socket.on('connect_error', (error) => {
      log(`❌ Chat connection error: ${error.message}`, 'red');
    });

    // Chat events
    socket.on('connected', (data) => {
      log('✅ Chat connection confirmed', 'green');
    });

    socket.on('joinedImageRoom', (data) => {
      log('✅ Joined image room successfully', 'green');
      joinedRoom = true;
      
      // Test sending a message
      socket.emit('sendMessage', {
        imageID: 'test-image-123',
        content: 'Hello from test script!'
      });
    });

    socket.on('newMessage', (message) => {
      log('📨 Received chat message:', 'green');
      console.log(JSON.stringify(message, null, 2));
    });

    socket.on('messageSent', (data) => {
      log('✅ Message sent successfully', 'green');
    });

    socket.on('userTyping', (data) => {
      log('⌨️ User typing event received', 'yellow');
    });

    socket.on('onlineUsers', (data) => {
      log('👥 Online users received:', 'yellow');
      console.log(JSON.stringify(data, null, 2));
    });

    socket.on('pong', (data) => {
      log('🏓 Pong received', 'yellow');
    });

    socket.on('error', (error) => {
      log(`❌ Chat error: ${error.message}`, 'red');
    });

    // Test completion
    setTimeout(() => {
      if (connected && joinedRoom) {
        log('✅ Chat WebSocket test passed', 'green');
      } else {
        log('❌ Chat WebSocket test failed', 'red');
      }
      socket.disconnect();
      resolve();
    }, 8000);
  });
}

// Test environment variables
function testEnvironmentVariables() {
  log('\n🔧 Testing Environment Variables...', 'blue');
  
  const requiredVars = [
    'NEXT_PUBLIC_WEBSOCKET_URL',
    'TEST_JWT_TOKEN'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log(`✅ ${varName}: ${value}`, 'green');
    } else {
      log(`❌ ${varName}: Not set`, 'red');
      allPresent = false;
    }
  });
  
  if (!allPresent) {
    log('\n⚠️ Some environment variables are missing. Create a .env file with:', 'yellow');
    log('NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001', 'yellow');
    log('TEST_JWT_TOKEN=your-valid-jwt-token', 'yellow');
  }
  
  return allPresent;
}

// Main execution
async function main() {
  log('🚀 Starting WebSocket Test Suite', 'blue');
  
  // Test environment variables first
  const envOk = testEnvironmentVariables();
  
  if (!envOk) {
    log('\n❌ Environment variables not properly configured. Exiting.', 'red');
    process.exit(1);
  }
  
  // Test WebSocket connections
  try {
    await testWebSocketConnections();
  } catch (error) {
    log(`❌ Test failed with error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  main();
}

module.exports = {
  testWebSocketConnections,
  testNotificationsWebSocket,
  testChatWebSocket,
  testEnvironmentVariables
}; 
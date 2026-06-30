// ==========================================
// 鱼鱼，这里我们先造一个小工具。
// 因为在网页里找一个东西，原本要写很长一串名字（document.getElementById），这样太累了。
// 所以我们给它起个外号叫 $。
// 以后只要看到 $('xxx')，意思就是“去页面上帮我把名字叫 xxx 的那个东西找出来”。
// ==========================================
const $ = id => document.getElementById(id);

// ==========================================
// 这一段是用来让屏幕上的时间走动起来的
// ==========================================
function updateTime() {
    // 偷看一眼现在现实世界是几点几分
    const now = new Date();
    
    // 拿到小时数。如果是个位数（比如早上9点），就在前面补个 '0'（变成 09）
    const h = String(now.getHours()).padStart(2, '0');
    // 拿到分钟数。同样，如果只有几分，前面也补个 '0'
    const m = String(now.getMinutes()).padStart(2, '0');
    
    // 接下来，如果在页面上能找到显示时间的地方，就把刚刚拿到的时间塞进去
    if($('time-text')) $('time-text').innerText = `${h}:${m}`; // 顶部的完整时间，比如 09:00
    if($('large-hour')) $('large-hour').innerText = h;         // 锁屏上大大的小时数字
    if($('large-minute')) $('large-minute').innerText = m;     // 锁屏上大大的分钟数字
    
    // 顺便把年月日也拼在一起放进去。这里的月份要 +1，是因为电脑很笨，它是从 0 开始数月份的。
    if($('date-text')) $('date-text').innerText = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
}

// 刚打开页面的时候，赶紧先对一次表，让画面显示当前时间
updateTime();
// 接着，给电脑定个死命令：每隔 1000 毫秒（也就是 1 秒），就去执行一次上面的动作。
// 这样你的时钟就会一秒一秒自己动啦。
setInterval(updateTime, 1000); 

// ==========================================
// 这一段是处理“长按解锁”的功能
// ==========================================
// 先找出页面上的“解锁按钮”和“整个手机外壳”
const unlockBtn = $('unlock-btn');
const phoneContainer = $('phoneContainer');

// 准备一个小本子，用来记“你按了多久”
let pressTimer;

// 当你的手指按下去的时候，会触发这个动作：
function startPress(e) {
    e.preventDefault(); // 拦住手机，别让它瞎触发默认动作（比如复制文字之类的）
    // 设定一个 750 毫秒（不到 1 秒）后的闹钟。
    // 如果 750 毫秒后你还没松手，手机就会给自己加上一个 'unlocked'（已解锁）的标记，锁就开了。
    pressTimer = setTimeout(() => phoneContainer.classList.add('unlocked'), 750); 
}

// 当你的手指松开、或者滑到别处的时候，触发这个动作：
function cancelPress() { 
    // 赶紧把刚刚那个 750 毫秒的闹钟取消掉！
    // 这样如果你按的时间不够长就松手了，锁就不会开。
    clearTimeout(pressTimer); 
}

// 检查一下，如果页面上确实有这个解锁按钮，我们就给它绑定刚才写好的动作：
if(unlockBtn) {
    // 'mousedown'是鼠标按下，'touchstart'是手指按在屏幕上
    // 只要按下了，就开始上面的 750 毫秒倒计时
    ['mousedown', 'touchstart'].forEach(evt => unlockBtn.addEventListener(evt, startPress));
    // 'mouseup'是鼠标松开，'mouseleave'是鼠标移走，'touchend'是手指离开屏幕
    // 只要没按着了，就立马取消倒计时
    ['mouseup', 'mouseleave', 'touchend'].forEach(evt => unlockBtn.addEventListener(evt, cancelPress));
}

// ==========================================
// 这一段是控制那个黑胶唱片机播放音乐的
// ==========================================
// 先把唱片机上的零件都找齐，免得等下找不到
const recordArea = $('recordArea'); // 整个唱片机区域
const recordDisc = $('recordDisc'); // 黑胶唱片那张盘
const tonearm = $('tonearm');       // 唱片的指针（唱臂）
const musicProgress = $('musicProgress'); // 音乐播放的进度条
const powerSwitch = $('powerSwitch'); // 播放开关按钮

// 记住当前的状态：
let isPlaying = false; // 是不是正在播放？（一开始没在放，所以是 false）
let progressVal = 0;   // 进度条一开始是 0
let playInterval;      // 拿来记“让进度条往前走”的定时器

// 按下播放/暂停时，执行这个动作：
function togglePlay() {
    // 状态反转：没在放就变成放，正在放就变成暂停
    isPlaying = !isPlaying;
    
    if(isPlaying) {
        // 加上了判空保护，避免因为找不到元素而报错
        if(tonearm) tonearm.classList.add('active-arm'); 
        if(recordDisc) recordDisc.classList.add('playing'); 
        if(powerSwitch) powerSwitch.classList.add('playing-switch'); 
        
        // 每隔 800 毫秒，进度条往前走一点点
        playInterval = setInterval(() => {
            // 如果进度达到或超过 100，就清零重来；不然就加 1
            progressVal = progressVal >= 100 ? 0 : progressVal + 1;
            // 让屏幕上进度条的宽度变长，看起来就像在正常播放一样
            if(musicProgress) musicProgress.style.width = progressVal + '%';
        }, 800);
    } else {
        // 同样加上判空保护
        if(tonearm) tonearm.classList.remove('active-arm'); 
        if(recordDisc) recordDisc.classList.remove('playing'); 
        if(powerSwitch) powerSwitch.classList.remove('playing-switch'); 
        
        // 把进度条往前走的定时器关掉，别让它继续跑了
        clearInterval(playInterval);
    }
}

// 如果页面上有唱片区域，当你点它的时候，就触发上面那个播放/暂停的开关动作
if(recordArea) recordArea.addEventListener('click', togglePlay);

// ==========================================
// 这一段是用来上传照片，并且把它当成背景图展示的
// ==========================================
// 找到你可以点的小组件（相框），还有真正用来传文件的隐藏按钮（长得比较丑，所以藏起来了）
const photoWidget = $('photoWidget');
const photoInput = $('photoInput');

if(photoWidget && photoInput) {
    // 当你点击好看的相框时，电脑就偷偷帮你去点那个隐藏起来的丑丑的上传按钮
    photoWidget.addEventListener('click', () => photoInput.click());

    // 当你真的在手机里选好了一张照片时（状态发生了 change）：
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; // 拿出你选的第一个文件
        
        // 确认一下：确实有文件，而且它是一张图片（不能是乱七八糟的文档）
        if (file && file.type.startsWith('image/')) {
            // 找一个叫 FileReader 的工具人，他专门负责读懂图片文件
            const reader = new FileReader();
            
            // 告诉工具人：当你读完这张图片后，照着做这几件事
            reader.onload = (readerEvent) => {
                // 把读出来的图片，当成背景图贴到我们的相框上
                photoWidget.style.backgroundImage = `url(${readerEvent.target.result})`;
                // 找找相框里有没有占位置的文字（比如原本写着“添加图片”的字）
                const placeholder = photoWidget.querySelector('.widget-placeholder');
                // 如果有，就把它藏起来（'none' 就是让它消失的意思）
                if(placeholder) placeholder.style.display = 'none'; 
            };
            
            // 吩咐完后，让他立刻开始读这张图片，转换成电脑能直接用来做背景图的格式
            reader.readAsDataURL(file);
        }
    });
}

// ==========================================
// 页面切换逻辑：桌面 <-> 聊天应用
// 这部分就是怎么从桌面点进聊天，又怎么退出来的
// ==========================================
const chatAppBtn = document.querySelector('.top-app-1'); // 代表“聊天软件”的图标按钮
const screenHome = document.querySelector('.screen-home'); // “手机桌面”这个大屏幕
const screenChatHome = $('screenChatHome');                // “聊天界面”这个大屏幕
const btnBackToHome = $('btnBackToHome');                  // 聊天界面里的“返回”按钮

// 监听 CHAT 桌面图标点击 (进入聊天)
if (chatAppBtn && screenHome && screenChatHome) {
    // 当你点击桌面上的聊天软件图标时
    chatAppBtn.addEventListener('click', () => {
        // 给桌面加个状态 'hide-to-bg'，意思就是让桌面退到后面隐藏起来
        screenHome.classList.add('hide-to-bg');
        // 给聊天界面加个状态 'active-screen'，让聊天界面蹦出来显示在前面
        screenChatHome.classList.add('active-screen');
    });
}

// 监听 聊天主页返回按钮点击 (回到桌面)
if (btnBackToHome) {
    // 当你点击返回按钮时，反过来操作：
    btnBackToHome.addEventListener('click', () => {
        // 把聊天界面的激活状态撤销掉，它就藏起来了
        screenChatHome.classList.remove('active-screen');
        // 把桌面的隐藏状态撤销掉，桌面就又回来了
        screenHome.classList.remove('hide-to-bg');
    });
}
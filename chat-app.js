/**
 * ==========================================
 * 联系人与票根设置模块 (Contacts & Char Ticket)
 * ==========================================
 */

/**
 * ==========================================
 * Constants 模块 (固定常量大仓库)
 * 说明：这是一个静态仓库！专门用来存一些“写死”的数据，也就是一上来就规定好、不轻易变的东西。
 * 比如这里默认存了自带角色“沈眠”的全部初始设定，就像游戏刚开局系统强行送你的初始装备。
 * ==========================================
 */
const Constants = {
  SHEN_MIAN: {
    id: 'shen_mian', locked: true, remark: '沈眠', nickname: '另外的蓝', uid: '20030904', bgImage: '', avatarImage: '', hasSyncedName: true,
    char: { name: '沈眠', image: 'https://cdncs.ykt.cbern.com.cn/v0.1/download?path=/zxx_feedback/qdqqd/1782469834792.png', signature: '陪你到天亮', gender: '男', occupation: '实习律师', tone: '寡言淡漠，话少但带温度，惯用短句，偶尔冷幽默', settings: '父母离异后发生转变，刻意塑造出与父亲截然相反的克制形象；习惯默默照顾他人，存在感如同背景白噪音；情感上偏好柔软依赖型对象；酒量极差，醉酒后会出现退行行为，变得黏人；日常佩戴眼镜。', date: '09.04', age: '23', rel_to_me: '助手', rel_to_them: '委托人', relationship: '委托' },
    user: { name: 'User', image: '', signature: '', gender: '', occupation: '', tone: '', settings: '', date: '', age: '', rel_to_me: '助手', rel_to_them: '委托人', relationship: '委托' }
  }
};

/**
 * ==========================================
 * StateManager 模块 (数据状态“管家婆”)
 * 说明：负责管理你所有的联系人数据。她不仅记住现在都有谁，还负责把这些数据存到你设备的
 * 缓存（localStorage）里，这样你刷新页面或者下次再打开，辛辛苦苦写的人物设定才不会丢！
 * ==========================================
 */
const StateManager = {
  roles: [], editingRoleId: null, ticketActiveType: 'char', currentProfileId: null, photoPickSlot: null,
  
  // 初始化方法：一上来先去本地找找有没有以前存过的数据，没有的话就把上面仓库里的“沈眠”拉过来充数。
  init() {
    this.roles = JSON.parse(localStorage.getItem('roles_v3')) || [Constants.SHEN_MIAN];
    
    // 兼容旧数据字段自动转换：如果你之前用过老版本，这里会自动把老版本的各种奇怪字段名，转换成新版本的名字，非常贴心！
    this.roles.forEach(role => {
      ['char', 'user'].forEach(type => {
        if (role[type]) {
          if (role[type].release !== undefined) { role[type].name = role[type].release; delete role[type].release; }
          if (role[type].director !== undefined) { role[type].gender = role[type].director; delete role[type].director; }
          if (role[type].cast !== undefined) { role[type].occupation = role[type].cast; delete role[type].cast; }
          if (role[type].title !== undefined) { role[type].signature = role[type].title; delete role[type].title; }
          if (role[type].rating !== undefined) { role[type].tone = role[type].rating; delete role[type].rating; }
          if (role[type].review !== undefined) { role[type].settings = role[type].review; delete role[type].review; }
          if (role[type].time !== undefined) { role[type].age = role[type].time; delete role[type].time; }
          if (role[type].theater !== undefined) { role[type].rel_to_me = role[type].theater; delete role[type].theater; }
          if (role[type].screen !== undefined) { role[type].rel_to_them = role[type].screen; delete role[type].screen; }
          if (role[type].seat !== undefined) { role[type].relationship = role[type].seat; delete role[type].seat; }
        }
      });
    });

    // 强行把沈眠的默认数据刷新一下，防止不小心改坏了
    let sm = this.getRole('shen_mian');
    if (sm) {
      sm.nickname = '另外的蓝'; sm.char.signature = '陪你到天亮'; sm.char.image = 'https://cdncs.ykt.cbern.com.cn/v0.1/download?path=/zxx_feedback/qdqqd/1782469834792.png'; sm.char.date = '09.04'; sm.char.age = '23'; sm.char.rel_to_me = '助手'; sm.char.rel_to_them = '委托人'; sm.char.settings = '父母离异后发生转变，刻意塑造出与父亲截然相反的克制形象；习惯默默照顾他人，存在感如同背景白噪音；情感上偏好柔软依赖型对象；酒量极差，醉酒后会出现退行行为，变得黏人；日常佩戴眼镜。';
    }
    this.save();
  },
  
  // 存数据：把当前的联系人列表打包，死死地存在本地，防止丢失！
  save() { localStorage.setItem('roles_v3', JSON.stringify(this.roles)); },
  
  // 找人功能：你给它一个人的ID，它就在列表里把这个人揪出来交给你。
  getRole(id) { return this.roles.find(r => r.id === id); },
  
  // 修改某人资料：告诉它你要改谁（id）、改什么（fieldPath，比如发色、名字）、改成什么（value），它就帮你改好并保存。
  updateRoleData(id, fieldPath, value) {
    const role = this.getRole(id);
    if (!role) return;
    const paths = fieldPath.split('.');
    if (paths.length === 1) role[paths[0]] = value;
    else if (paths.length === 2) role[paths[0]][paths[1]] = value;
    this.save();
  },
  
  // 凭空造人：当你点“添加好友”时，它就负责生成一个全是默认空白数据的“新角色”，塞进通讯录里。
  createRole() {
    const newRole = {
      id: 'role_' + Date.now(), locked: false, remark: 'character', nickname: '', uid: String(Math.floor(10000000 + Math.random() * 90000000)), bgImage: '', avatarImage: '', hasSyncedName: false,
      char: { name: 'character', image: '', signature: '', gender: '', occupation: '', tone: '', settings: '', date: '', age: '', rel_to_me: '', rel_to_them: '', relationship: '' },
      user: { name: 'User', image: '', signature: '', gender: '', occupation: '', tone: '', settings: '', date: '', age: '', rel_to_me: '', rel_to_them: '', relationship: '' }
    };
    this.roles.push(newRole); this.save(); return newRole;
  }
};

/**
 * ==========================================
 * Utils 模块 (小工具百宝箱)
 * 说明：这里装的都是一些杂七杂八但是很实用的“纯计算”小工具，哪里需要就可以在哪调用。
 * ==========================================
 */
const Utils = {
  // 转义 HTML 字符，防止 XSS 攻击
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  // 查字典小能手：你给它一个汉字，它能告诉你这个汉字的拼音首字母是什么（比如“沈”就是S），专门用来给通讯录按字母排序。
  getPinyinInitial(char) {
    if (!char) return '#';
    const first = char.charAt(0);
    if (/[a-zA-Z]/.test(first)) return first.toUpperCase();
    if (!/[\u4e00-\u9fa5]/.test(first)) return first.toUpperCase(); 
    const letters = 'ABCDEFGHJKLMNOPQRSTWXYZ'.split('');
    const zhBounds = '阿八嚓哒妸发旮哈讥咔垃妈拏噢妑七呥仨他哇夕丫匝'.split('');
    const surnames = {'沈':'S', '鱼':'Y', '张':'Z', '王':'W', '李':'L', '刘':'L', '陈':'C', '杨':'Y', '黄':'H', '赵':'Z', '吴':'W', '周':'Z', '徐':'X', '孙':'S', '马':'M', '朱':'Z', '胡':'H', '郭':'G', '何':'H', '高':'G', '林':'L', '郑':'Z', '谢':'X', '韩':'H', '唐':'T', '冯':'F', '于':'Y', '董':'D', '萧':'X', '程':'C', '曹':'C', '袁':'Y', '邓':'D', '许':'X', '傅':'F', '苏':'S', '叶':'Y', '蒋':'J', '卫':'W', '魏':'W', '蔡':'C', '方':'F', '宋':'S', '龚':'G', '崔':'C', '彭':'P', '陆':'L', '白':'B'};
    if (surnames[first]) return surnames[first];
    for (let i = 0; i < zhBounds.length; i++) {
      if (first.localeCompare(zhBounds[i], 'zh-Hans-CN') < 0) return i === 0 ? letters[0] : letters[i - 1];
    }
    return letters[letters.length - 1];
  },
  
  // 拿名字首字母：如果是英文就拿第一个字母，如果是中文就调用上面的拼音工具。
  getNameInitial(name) { return !name ? '?' : this.getPinyinInitial(name[0]); },
  
  // 提示词生成器：像写作文一样，把角色的名字、性格、关系等等，自动拼成一大段话，以后发给AI，让AI乖乖“入戏”。
  buildSystemPrompt(role) {
    const c = role.char, u = role.user;
    const promptLines = [
      `【角色设定】`, 
      `姓名：${c.name}`, 
      `性别：${c.gender}`, 
      `职业：${c.occupation}`, 
      `签名：${c.signature}`, 
      `语气：${c.tone}`, 
      `人设：${c.settings}`, 
      `生日：${c.date} 年龄：${c.age}`, 
      ``, 
      `【关系设定】`, 
      `对方(用户)对你的关系定位：${c.rel_to_them}`, 
      `你对对方(用户)的关系定位：${c.rel_to_me}`, 
      `关系性质：${c.relationship}`, 
      `请理解你自己与用户之间的关系定位，并自然地在对话中体现，不需要直接用这个词称呼对方。`
    ];
    if (u.settings) promptLines.push(`\n【用户设定】\n${u.settings}`);
    return promptLines.filter(Boolean).join('\n');
  }
};

/**
 * ==========================================
 * ContactsDOM 模块 (页面元素“收集册”)
 * 说明：这是一个跑腿小弟。为了防止每次你要修改页面时都要去现找某个按钮在哪儿，
 * 它一上来就把页面上所有关键的HTML标签（比如各种按钮、弹窗、图片框）都找好存起来，随用随叫。
 * ==========================================
 */
const ContactsDOM = {
  imgPicker: document.getElementById('imagePicker'), bgPicker: document.getElementById('bgPicker'), avatarPicker: document.getElementById('avatarPicker'), photoPicker: document.getElementById('photoPicker'),
  tplContactItem: document.getElementById('tpl-contact-item'), tplAlphaTitle: document.getElementById('tpl-alpha-title'),
  screenContacts: document.getElementById('tab-contacts'), subnavContainer: document.getElementById('subnavContainer'), subnavIndicator: document.getElementById('subnavIndicator'), panelsWrapper: document.getElementById('panelsWrapper'), btnAddMenu: document.getElementById('btnAddMenu'), addMenuOverlay: document.getElementById('addMenuOverlay'), addMenuBubble: document.getElementById('addMenuBubble'), btnGoAddFriend: document.getElementById('btnGoAddFriend'), btnGoCreateGroup: document.getElementById('btnGoCreateGroup'), friendListGroup: document.getElementById('friend-list-group'), friendListAlpha: document.getElementById('friend-list-alpha'), botList: document.getElementById('bot-list'), groupCount: document.getElementById('group-count'), botCount: document.getElementById('bot-count'),
  profileScreen: document.getElementById('profileScreen'), profileBg: document.getElementById('profileBg'), profileBgImg: document.getElementById('profileBgImg'), profileBackBtn: document.getElementById('profileBackBtn'), profileAvatarWrap: document.getElementById('profileAvatarWrap'), profileAvatar: document.getElementById('profileAvatar'), profileAvatarImg: document.getElementById('profileAvatarImg'), profileAvatarInitial: document.getElementById('profileAvatarInitial'), profileRemark: document.getElementById('profileRemark'), profileNickname: document.getElementById('profileNickname'), profileIdText: document.getElementById('profileIdText'), profileSignature: document.getElementById('profileSignature'), profilePhotosGrid: document.getElementById('profilePhotosGrid'), btnProfileSettings: document.getElementById('btnProfileSettings'), btnProfileChat: document.getElementById('btnProfileChat'),
  ticketModal: document.getElementById('ticketModal'), stripToggle: document.getElementById('stripToggle'), ticketStrip: document.getElementById('ticketStrip'), flipper: document.getElementById('mainFlipper'), faceFront: document.getElementById('faceFront'), faceBack: document.getElementById('faceBack'), frontName: document.getElementById('frontName'), backGrid: document.getElementById('backGrid'), miniBoxes: { char: document.querySelector('.mini-ticket-container[data-type="char"] .mini-box'), user: document.querySelector('.mini-ticket-container[data-type="user"] .mini-box') },
  bgImages: () => document.querySelectorAll('#ticketModal .ticket-bg-img'), backInputs: () => document.querySelectorAll('#ticketModal .back-input, #ticketModal .back-textarea')
};

/**
 * ==========================================
 * ContactsController 模块 (通讯录列表大总管)
 * 说明：负责把上面管家婆(StateManager)里的数据，一个一个地画到手机屏幕上的列表里。
 * 控制列表长什么样，以及按ABCD字母顺序排队。
 * ==========================================
 */
const ContactsController = {
  // 捏小卡片：把一个角色的数据拿过来，套进HTML模板里，捏出一个可以在通讯录列表里显示的“长方形联系人条目”。
  createContactElement(role) {
    const clone = ContactsDOM.tplContactItem.content.cloneNode(true);
    const item = clone.querySelector('.contact-item');
    const avatar = clone.querySelector('.contact-avatar');
    const nameEl = clone.querySelector('.contact-list-name');
    const statusEl = clone.querySelector('.contact-status');
    const name = role.remark || role.char.name || '?';
    const initial = Utils.getNameInitial(name);
    
    item.dataset.roleId = role.id;
    if (role.avatarImage) { avatar.style.backgroundImage = `url(${role.avatarImage})`; avatar.style.backgroundSize = 'cover'; avatar.style.backgroundPosition = 'center'; avatar.style.fontSize = '0'; } 
    else if (role.id === 'shen_mian') { avatar.style.backgroundImage = 'url(https://yun.jxnews.com.cn/sjfxt/image/6a3c87471052416d94933d66.png)'; avatar.style.backgroundSize = 'cover'; avatar.style.backgroundPosition = 'center'; avatar.style.fontSize = '0'; }
    else { avatar.textContent = name === 'character' ? 'C' : initial; }
    nameEl.textContent = name; statusEl.textContent = role.char.signature || '';
    return clone;
  },
  
  // 捏字母标题：就是通讯录里那个用来分类的“A”、“B”、“C”那种小标题。
  createAlphaTitleElement(titleStr) {
    const clone = ContactsDOM.tplAlphaTitle.content.cloneNode(true);
    clone.querySelector('.alpha-title').textContent = titleStr; return clone;
  },
  
  // 排队点名并展示：把所有人分成“好友”和“机器人”，按照名字的首字母顺序列出来，最后一条条塞到手机屏幕上。
  renderList() {
    const roles = StateManager.roles;
    const bots = roles.filter(r => r.id === 'shen_mian' || r.type === 'bot');
    const friends = roles.filter(r => r.id !== 'shen_mian' && r.type !== 'bot');
    ContactsDOM.friendListGroup.innerHTML = ''; ContactsDOM.botList.innerHTML = ''; ContactsDOM.friendListAlpha.innerHTML = '';
    friends.forEach(r => ContactsDOM.friendListGroup.appendChild(this.createContactElement(r)));
    bots.forEach(r => ContactsDOM.botList.appendChild(this.createContactElement(r)));
    
    const sorted = [...friends].sort((a, b) => Utils.getNameInitial(a.remark || a.char.name).localeCompare(Utils.getNameInitial(b.remark || b.char.name)));
    let lastLetter = '';
    sorted.forEach(r => {
      const cur = Utils.getNameInitial(r.remark || r.char.name);
      if (cur !== lastLetter) { lastLetter = cur; ContactsDOM.friendListAlpha.appendChild(this.createAlphaTitleElement(lastLetter)); }
      ContactsDOM.friendListAlpha.appendChild(this.createContactElement(r));
    });
    ContactsDOM.groupCount.textContent = `${friends.length}/${friends.length}`; ContactsDOM.botCount.textContent = bots.length;
  },
  
  // 切换顶部标签：比如你在“好友”和“群聊”之间切换，底下的下划线动画就是它控制的。
  switchTab(tabIndex) {
    document.querySelectorAll('.subnav-item').forEach((el, j) => el.classList.toggle('active', j === tabIndex));
    ContactsDOM.subnavIndicator.style.transform = `translateX(${tabIndex * 100}%)`;
    document.querySelectorAll('.sub-tab-panel').forEach((p, j) => { p.classList.toggle('active', j === tabIndex); p.style.transform = ''; p.style.transition = ''; });
  },
  
  // 展开/收起分组：点一下那个小箭头，列表内容就展开或者藏起来。
  toggleGroup(headerElement) { headerElement.parentElement.classList.toggle('expanded'); },
  
  // 右上角的加号菜单：控制那个“添加好友/创建群聊”的小黑框显示或隐藏。
  showAddMenu(show) { ContactsDOM.addMenuOverlay.classList.toggle('show', show); }
};

/**
 * ==========================================
 * ProfileController 模块 (个人详细主页负责人)
 * 说明：当你点击联系人列表里的某个人时，从右边滑出来的那个全屏大主页（带有朋友圈相册背景的那种）就是它管的。
 * ==========================================
 */
const ProfileController = {
  // 打开某人的主页
  open(id) {
    StateManager.currentProfileId = id; const role = StateManager.getRole(id); if (!role) return;
    this.render(role); ContactsDOM.profileScreen.classList.add('active');
  },
  
  // 关掉主页，退回到列表
  close() { ContactsDOM.profileScreen.classList.remove('active'); StateManager.currentProfileId = null; },
  
  // 画主页内容：把某人的各种资料（比如背景图、头像、名字、个性签名），老老实实地填到页面对应的坑位上。
  render(role) {
    ContactsDOM.profileBgImg.src = role.bgImage || ''; ContactsDOM.profileBgImg.style.display = role.bgImage ? 'block' : 'none';
    const name = role.remark || role.char.name || '?'; ContactsDOM.profileAvatarInitial.textContent = name === 'character' ? 'C' : Utils.getNameInitial(name);
    if (role.avatarImage) { ContactsDOM.profileAvatarImg.src = role.avatarImage; ContactsDOM.profileAvatarImg.classList.add('loaded'); ContactsDOM.profileAvatarInitial.style.display = 'none'; } 
    else if (role.id === 'shen_mian') { ContactsDOM.profileAvatarImg.src = 'https://yun.jxnews.com.cn/sjfxt/image/6a3c87471052416d94933d66.png'; ContactsDOM.profileAvatarImg.classList.add('loaded'); ContactsDOM.profileAvatarInitial.style.display = 'none'; }
    else { ContactsDOM.profileAvatarImg.classList.remove('loaded'); ContactsDOM.profileAvatarInitial.style.display = ''; }
    ContactsDOM.profileRemark.textContent = role.remark || role.char.name || '未设置备注'; ContactsDOM.profileNickname.textContent = role.nickname || '未设置网名'; ContactsDOM.profileIdText.textContent = `ID: ${role.uid || ''}`; ContactsDOM.profileSignature.textContent = role.char.signature || '';
    this.renderPhotos(role);
  },
  
  // 画主页相册：主页底下的那4张小照片坑位，有图就展示图，没图就展示个“加号”。
  renderPhotos(role) {
    const photos = role.photos || ['', '', '', '']; const slots = ContactsDOM.profilePhotosGrid.querySelectorAll('.photo-slot');
    slots.forEach((slot, i) => {
      const img = slot.querySelector('img'); const del = slot.querySelector('.photo-slot-del'); const plus = slot.querySelector('.photo-slot-plus');
      if (photos[i]) { img.src = photos[i]; img.classList.add('loaded'); del.style.display = 'flex'; plus.style.display = 'none'; } 
      else { img.src = ''; img.classList.remove('loaded'); del.style.display = 'none'; plus.style.display = ''; }
    });
  }
};

/**
 * ==========================================
 * TicketController 模块 (设定卡片/票根编辑负责人)
 * 说明：你在主页点“设置”时弹出的那个能像卡片一样翻面的“Ticket”弹窗就是它管。
 * 专门用来修改角色的性格、年龄等设定。还能翻转过来，让你顺便设定“你自己(User)”的角色。
 * ==========================================
 */
const TicketController = {
  // 弹开编辑卡片
  open(id) {
    if (!id) return; StateManager.editingRoleId = id; StateManager.ticketActiveType = 'char';
    document.querySelectorAll('#ticketStrip .mini-ticket-container').forEach((el, i) => el.classList.toggle('active', i === 0));
    ContactsDOM.flipper.classList.remove('flipped'); this.render(); ContactsDOM.ticketModal.classList.add('show');
  },
  
  // 关掉卡片
  close() { ContactsDOM.ticketModal.classList.remove('show'); },
  
  // 获取当前正在编辑的是谁的数据（是角色，还是你自己的设定？）
  getData() { const id = StateManager.editingRoleId; const type = StateManager.ticketActiveType; return id ? (StateManager.getRole(id)?.[type] || {}) : {}; },
  
  // 修改卡片上的内容，并且立马同步给管家婆（StateManager）让它存起来。如果是改了名字，还会顺便把你通讯录上的名字也刷新一下。
  setData(field, value) {
    const id = StateManager.editingRoleId; const type = StateManager.ticketActiveType;
    if (id) {
      const role = StateManager.getRole(id);
      if (role && (!role.locked || type === 'user')) {
        StateManager.updateRoleData(id, `${type}.${field}`, value);
        if (type === 'char' && field === 'name' && !role.hasSyncedName && value?.trim()) {
          StateManager.updateRoleData(id, 'remark', value.trim());
          if (StateManager.currentProfileId === id) { ContactsDOM.profileRemark.textContent = role.remark || role.char.name || '未设置备注'; ContactsDOM.profileAvatarInitial.textContent = Utils.getNameInitial(role.remark); }
        }
        if (field === 'signature' && StateManager.currentProfileId === id) ContactsDOM.profileSignature.textContent = value;
        ContactsController.renderList();
        AppUI.updateRoleNameDisplays(id);
      }
    }
  },
  
  // 画卡片：把数据填进卡片的各个输入框里，顺便搞定翻面的特效处理。
  render() {
    const id = StateManager.editingRoleId; const type = StateManager.ticketActiveType; if (!id) return;
    const role = StateManager.getRole(id); const isLocked = (role?.locked && type === 'char'); const data = this.getData();
    ContactsDOM.frontName.textContent = data.name || (type === 'char' ? 'Character' : 'User'); ContactsDOM.frontName.style.color = 'var(--back-ink)'; ContactsDOM.frontName.contentEditable = isLocked ? 'false' : 'true'; ContactsDOM.frontName.dataset.locked = isLocked;
    ContactsDOM.backGrid.classList.toggle('locked', isLocked);
    ContactsDOM.bgImages().forEach(img => { img.src = data.image || ''; img.style.display = data.image ? 'block' : 'none'; });
    ContactsDOM.backInputs().forEach(inp => { const field = inp.getAttribute('data-field'); if (field) inp.value = data[field] || ''; });
    ContactsDOM.miniBoxes.char.style.backgroundImage = role?.char?.image ? `url(${role.char.image})` : 'none'; ContactsDOM.miniBoxes.user.style.backgroundImage = role?.user?.image ? `url(${role.user.image})` : 'none';
    document.getElementById('ticketOriginLabel').textContent = type === 'char' ? 'CHARACTER DESIGN' : 'USER DESIGN'; document.getElementById('ticketNo').textContent = `NO. ${StateManager.roles.findIndex(r => r.id === id) + 1}`;
  },
  
  // 确认修改并关闭卡片。
  commit() {
    const role = StateManager.getRole(StateManager.editingRoleId);
    if (role && !role.hasSyncedName && role.char.name?.trim()) StateManager.updateRoleData(role.id, 'hasSyncedName', true);
    this.close();
  }
};

/**
 * ==========================================
 * ContactsEventManager 模块 (联系人界面的“点击事件绑定员”)
 * 说明：监控员！专门盯着你在联系人列表、主页、设置卡片里点击了哪里。
 * 你只要一点，它就赶紧通知上面的各种Controller去干活。
 * ==========================================
 */
const ContactsEventManager = {
  // 一键绑定所有监听！
  bindAll() { this.bindContactsEvents(); this.bindProfileEvents(); this.bindTicketEvents(); this.bindFilePickers(); },
  
  // 监听联系人列表上的点击（比如切换顶部Tab、点某个人）
  bindContactsEvents() {
    ContactsDOM.subnavContainer.addEventListener('click', e => { const item = e.target.closest('.subnav-item'); if (item) ContactsController.switchTab(Number(item.dataset.tab)); });
    ContactsDOM.panelsWrapper.addEventListener('click', e => {
      const header = e.target.closest('[data-action="toggle-group"]'); if (header) return ContactsController.toggleGroup(header);
      const contactItem = e.target.closest('.contact-item'); if (contactItem) ProfileController.open(contactItem.dataset.roleId);
    });
    ContactsDOM.btnAddMenu.addEventListener('click', () => ContactsController.showAddMenu(true));
    ContactsDOM.addMenuOverlay.addEventListener('click', e => { if (!ContactsDOM.addMenuBubble.contains(e.target)) ContactsController.showAddMenu(false); });
    ContactsDOM.btnGoAddFriend.addEventListener('click', () => { ContactsController.showAddMenu(false); StateManager.createRole(); ContactsController.renderList(); });
    ContactsDOM.btnGoCreateGroup.addEventListener('click', () => ContactsController.showAddMenu(false));
  },
  
  // 监听个人主页上的点击（比如点返回键、长按换背景图、点名字可以直接改名、点发消息去聊天）
  bindProfileEvents() {
    let bgPressTimer;
    // 长按背景图0.5秒就可以换背景啦
    const startBgPress = (e) => { if (e.target === ContactsDOM.profileBackBtn || ContactsDOM.profileBackBtn.contains(e.target)) return; bgPressTimer = setTimeout(() => ContactsDOM.bgPicker.click(), 500); };
    const cancelBgPress = () => clearTimeout(bgPressTimer);
    ContactsDOM.profileBg.addEventListener('mousedown', startBgPress); ContactsDOM.profileBg.addEventListener('touchstart', startBgPress, { passive: true });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => ContactsDOM.profileBg.addEventListener(evt, cancelBgPress));
    ContactsDOM.profileBackBtn.addEventListener('click', () => ProfileController.close()); ContactsDOM.profileAvatarWrap.addEventListener('click', () => ContactsDOM.avatarPicker.click());
    
    // 让主页上的文字（名字、签名）点击后变成可以打字修改的状态！
    [ContactsDOM.profileRemark, ContactsDOM.profileNickname, ContactsDOM.profileIdText, ContactsDOM.profileSignature].forEach(el => {
      el.addEventListener('click', function() {
        const role = StateManager.getRole(StateManager.currentProfileId); if (!role) return;
        this.contentEditable = "true"; this.focus();
        if (typeof window.getSelection !== "undefined") { const range = document.createRange(); range.selectNodeContents(this); range.collapse(false); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); }
      });
      el.addEventListener('blur', function() {
        this.contentEditable = "false"; const roleId = StateManager.currentProfileId; const role = StateManager.getRole(roleId); if (!role) return;
        const field = this.dataset.edit; let val = this.innerText.trim();
        if (field === 'uid') val = val.replace(/^ID:\s*/i, '').trim();
        if (field === 'remark' && val === '未设置备注') val = ''; if (field === 'nickname' && val === '未设置网名') val = '';
        if (field === 'signature') StateManager.updateRoleData(roleId, 'char.signature', val); else StateManager.updateRoleData(roleId, field, val);
        ProfileController.render(StateManager.getRole(roleId)); ContactsController.renderList();
        AppUI.updateRoleNameDisplays(roleId);
      });
      el.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); this.blur(); } });
    });
    
    // 点“设置”按钮弹出卡片，点“发消息”按钮跳转到聊天界面
    ContactsDOM.btnProfileSettings.addEventListener('click', () => { if (StateManager.currentProfileId) TicketController.open(StateManager.currentProfileId); });
    ContactsDOM.btnProfileChat.addEventListener('click', () => {
      const roleId = StateManager.currentProfileId;
      ProfileController.close();
      AppUI.createChatWindow(roleId);
      AppUI.openChat(`chatScreen-${roleId}`, null);
    });
  },
  
  // 监听设定卡片（Ticket）上的点击（比如翻面特效、在输入框里打字）
  bindTicketEvents() {
    ContactsDOM.ticketModal.addEventListener('click', e => { if (!e.target.closest('.ticket-workspace')) TicketController.commit(); });
    ContactsDOM.stripToggle.addEventListener('click', () => TicketController.commit());
    ContactsDOM.ticketStrip.addEventListener('click', e => { 
      const container = e.target.closest('.mini-ticket-container'); if (!container) return; 
      const type = container.dataset.type; 
      if (e.target.closest('[data-action="pick-image"]')) { StateManager.ticketActiveType = type; ContactsDOM.imgPicker.click(); return; } 
      document.querySelectorAll('#ticketStrip .mini-ticket-container').forEach(el => el.classList.remove('active')); container.classList.add('active'); 
      if (ContactsDOM.flipper.classList.contains('flipped')) { ContactsDOM.flipper.classList.remove('flipped'); setTimeout(() => { StateManager.ticketActiveType = type; TicketController.render(); }, 300); } 
      else { StateManager.ticketActiveType = type; TicketController.render(); } 
    });
    ContactsDOM.faceFront.addEventListener('click', e => { if (e.target === ContactsDOM.frontName) return; ContactsDOM.flipper.classList.add('flipped'); });
    ContactsDOM.faceBack.addEventListener('click', e => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('.back-grid')) return; ContactsDOM.flipper.classList.remove('flipped'); });
    ContactsDOM.frontName.addEventListener('blur', e => { if (ContactsDOM.frontName.dataset.locked === 'true') return; const val = e.target.innerText.trim() || (StateManager.ticketActiveType === 'char' ? 'Character' : 'User'); e.target.innerText = val; TicketController.setData('name', val); });
    ContactsDOM.frontName.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } });
    ContactsDOM.backInputs().forEach(inp => inp.addEventListener('input', e => { const field = e.target.getAttribute('data-field'); if (field) TicketController.setData(field, e.target.value); }));
  },
  
  // 监听相册选图片：你选了张图，它就把图转换成一长串代码（base64）存下来，好让界面能直接显示出来。
  bindFilePickers() {
    const handleFileSelect = (picker, cb) => picker.addEventListener('change', e => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = ev => cb(ev.target.result); r.readAsDataURL(file); e.target.value = ''; });
    handleFileSelect(ContactsDOM.bgPicker, (base64) => { if (StateManager.currentProfileId) { StateManager.updateRoleData(StateManager.currentProfileId, 'bgImage', base64); ProfileController.render(StateManager.getRole(StateManager.currentProfileId)); } });
    handleFileSelect(ContactsDOM.avatarPicker, (base64) => { if (StateManager.currentProfileId) { StateManager.updateRoleData(StateManager.currentProfileId, 'avatarImage', base64); ProfileController.render(StateManager.getRole(StateManager.currentProfileId)); ContactsController.renderList(); AppUI.updateRoleNameDisplays(StateManager.currentProfileId); } });
    handleFileSelect(ContactsDOM.photoPicker, (base64) => { if (StateManager.currentProfileId) { const role = StateManager.getRole(StateManager.currentProfileId); const newPhotos = role.photos ? [...role.photos] : ['', '', '', '']; newPhotos[StateManager.photoPickSlot] = base64; StateManager.updateRoleData(StateManager.currentProfileId, 'photos', newPhotos); ProfileController.renderPhotos(StateManager.getRole(StateManager.currentProfileId)); } });
    handleFileSelect(ContactsDOM.imgPicker, (base64) => {
        if(ContactsDOM.ticketModal.classList.contains('show')){
            TicketController.setData('image', base64); TicketController.render();
        }
    });
  }
};

/**
 * ==========================================
 * ScrollBounceController 模块 (滑动弹簧特效师)
 * 说明：这是一个纯为了“手感”存在的打工人。它的作用是：当你在联系人列表滑到最底下了，
 * 继续往下使劲拖，列表会被你拉出一个“QQ弹弹”的留白，一松手又会像弹簧一样缩回去（橡皮筋特效）。
 * ==========================================
 */
const ScrollBounceController = {
  // 开始监听手指向下滑动的动作
  init() {
    this.wrapper = ContactsDOM.panelsWrapper; this.startY = 0; this.currentPull = 0; this.maxPull = 87; this.isPulling = false;
    this.wrapper.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true }); this.wrapper.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false }); ['touchend', 'touchcancel'].forEach(evt => this.wrapper.addEventListener(evt, this.onTouchEnd.bind(this)));
  },
  onTouchStart(e) { this.startY = e.touches[0].clientY; this.currentPull = 0; this.isPulling = false; const activePanel = this.wrapper.querySelector('.sub-tab-panel.active'); if (activePanel) activePanel.style.transition = 'none'; },
  onTouchMove(e) {
    const deltaY = this.startY - e.touches[0].clientY; const isAtBottom = Math.ceil(this.wrapper.scrollTop + this.wrapper.clientHeight) >= this.wrapper.scrollHeight - 2;
    // 如果已经滑到底了，还要往下拽，那就给它加上位移（扯皮筋）
    if (isAtBottom && deltaY > 0) { this.isPulling = true; if (e.cancelable) e.preventDefault(); let pull = deltaY * 0.6; if (pull > this.maxPull) pull = this.maxPull + (pull - this.maxPull) * 0.1; this.currentPull = pull; const activePanel = this.wrapper.querySelector('.sub-tab-panel.active'); if (activePanel) activePanel.style.transform = `translateY(-${this.currentPull}px)`; } 
    else if (this.isPulling && deltaY <= 0) { this.isPulling = false; this.currentPull = 0; const activePanel = this.wrapper.querySelector('.sub-tab-panel.active'); if (activePanel) activePanel.style.transform = `translateY(0)`; }
  },
  // 手指松开，皮筋弹回去！
  onTouchEnd() { if (this.isPulling) { const activePanel = this.wrapper.querySelector('.sub-tab-panel.active'); if (activePanel) { activePanel.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.3, 1)'; activePanel.style.transform = `translateY(0)`; } this.isPulling = false; this.currentPull = 0; } }
};


/**
 * ==========================================
 * 聊天与核心交互模块 (Chat & Global - 无API版)
 * ==========================================
 */

/**
 * ==========================================
 * AppConfig 模块 (聊天界面的基础配置箱)
 * 说明：这里放着聊天功能必须用到的杂七杂八的数据。比如你长按聊天记录弹出的菜单里，
 * 那些“撤回”、“复制”、“删除”按钮的小图标链接，还有默认自带的Emoji表情包，都在这里。
 * ==========================================
 */
const AppConfig = {
  ICONS: { favorite: 'icons/bookmark.svg', edit: 'icons/edit.svg', recall: 'icons/recall.svg', quote: 'icons/quote.svg', delete: 'icons/delete.svg', copy: 'icons/copy.svg', select: 'icons/select.svg' },
  DEFAULT_EMOJIS: ['😺','😸','😼','😽','😾','😿','😻','😹','🙀','❤️','🔥','✨','👍','😭','😂','🥺','👀','💯','🎉','🤔','🙌','👏','🎈','💥', '💤'],
  TABS: ['tab-messages', 'tab-contacts', 'tab-space', 'tab-schedule', 'tab-moments']
};

/**
 * ==========================================
 * AppState 模块 (聊天界面的“临时记忆库”)
 * 说明：它像金鱼的记忆一样，专门记此时此刻你在操作什么。
 * 比如：你是不是正在拽一个表情包？你现在在哪个人开的聊天框里？
 * 你是不是正在长按消息准备删除？（只要页面一刷新它就忘了，只管眼下）
 * ==========================================
 */
const AppState = {
  _state: { customEmojis: [], isAITyping: false, isDraggingEmoji: false, dragSrcIndex: null, emojiDragTimer: null, activeTargetRow: null, menuJustOpened: false, pressTimer: null, menuFadeTimer: null, currentActiveNav: null, currentChatId: null, currentQuoteText: "" },
  
  // 一上来先把表情包从本地存的记忆里挖出来
  init() { this._state.customEmojis = JSON.parse(localStorage.getItem('customEmojis')) || [...AppConfig.DEFAULT_EMOJIS]; },
  getState() { return this._state; },
  setState(obj) { Object.assign(this._state, obj); },
  
  // 保存表情包：如果你自己加了新表情，它会立刻存进你的设备里。
  saveEmojis() { localStorage.setItem('customEmojis', JSON.stringify(this._state.customEmojis)); },
  
  // 保存聊天记录：把你发过的话、对面回的话，完完整整地拍下来存进本地缓存里。
  saveChatRecord(areaId) { const area = document.getElementById(areaId); if (area) { localStorage.setItem(areaId, area.innerHTML); AppUI.updateListPreviews(areaId.replace('msgArea-', '')); } }
};

/**
 * ==========================================
 * AppUI 模块 (聊天界面的包工头)
 * 说明：整个聊天界面里最辛苦的打工人！不管是要算发消息的时间、把你说的话画进气泡里、
 * 弹出一个黑色的小菜单、甚至让消息红点能像果冻一样拖拽，这些脏活累活全都是它一行行代码干出来的。
 * ==========================================
 */
const AppUI = {
  DOM: { contextMenu: () => document.getElementById('msgContextMenu'), inlinePicker: () => document.getElementById('inlineReactionPicker'), reactionGrid: () => document.getElementById('reactionGridInner'), navItems: () => document.querySelectorAll('.nav-item'), indicator: () => document.getElementById('indicator'), navBar: () => document.getElementById('navBar') },
  getTouch: (e) => e.type.includes('touch') ? (e.touches[0] || e.changedTouches[0]) : e,
  
  // 头像制造机：如果你没有传图片头像，它就会聪明地截取你名字的第一个字或者拼音塞进去当头像。
  getAvatarHtml: (isUser = false, roleId = 'shen_mian') => {
    if (isUser) return `<div class="msg-avatar" style="background: rgba(158, 197, 232, 0.2); display:flex; justify-content:center; align-items:center; color:#fff; font-size: 16px;">U</div>`;
    const role = StateManager.getRole(roleId);
    if (roleId === 'shen_mian' && (!role || !role.avatarImage)) return `<img src="https://yun.jxnews.com.cn/sjfxt/image/6a3c87471052416d94933d66.png" class="msg-avatar">`;
    if (role && role.avatarImage) return `<div class="msg-avatar" style="background-image:url(${role.avatarImage}); background-size:cover; background-position:center;"></div>`;
    const name = role ? (role.remark || role.char.name || '?') : '?';
    const initial = Utils.getNameInitial(name);
    return `<div class="msg-avatar" style="background:#333; display:flex; justify-content:center; align-items:center; font-size:16px; color:#fff; font-weight:bold;">${initial}</div>`;
  },
  
  // 时间计算员：看看这条消息是不是昨天或者前天发的，如果是就给你加上“昨天 xx:xx”，否则就只显示时间。
  formatMessageTime(tsRaw) {
    const d = new Date(parseInt(tsRaw)), now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate()), targetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()), diffDays = Math.ceil((today - targetDay) / (1000 * 60 * 60 * 24));
    let dateStr = diffDays === 1 ? '昨天 ' : diffDays === 2 ? '前天 ' : diffDays > 2 ? `${d.getMonth() + 1}-${d.getDate()} ` : '';
    return `${dateStr}${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },
  getMsgTimeInfo() { const now = Date.now(); return { ts: now, timeStr: this.formatMessageTime(now) }; },
  getGreeting() { const hr = new Date().getHours(); return hr < 12 ? 'GOOD MORNING' : hr < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING'; },
  
  // 消息预览更新员：在外面的消息列表里，下面那行灰色的小字（也就是最新的一条聊天内容）就是它负责更新的。
  updateListPreviews(idStr) {
    let ids = [];
    if (idStr) {
      ids = [idStr];
    } else {
      document.querySelectorAll('.screen-chat').forEach(screen => {
        ids.push(screen.id.replace('chatScreen-', ''));
      });
    }
    ids.forEach(id => {
      const msgArea = document.getElementById('msgArea-' + id); if (!msgArea) return;
      const rows = Array.from(msgArea.querySelectorAll('.msg-row')).filter(r => !r.querySelector('.typing-indicator'));
      let lastText = '暂无消息', lastTimeStr = '';
      if (rows.length > 0) {
        const lastRow = rows[rows.length - 1]; const bubble = lastRow.querySelector('.msg-bubble');
        if (bubble) { let clone = bubble.cloneNode(true); clone.querySelectorAll('.quote-ref, div[style*="border-left: 2px solid #f2c94c"]').forEach(q => q.remove()); lastText = clone.innerText.trim().replace(/\n/g, ' ') || '暂无消息'; } 
        else if (lastRow.querySelector('.msg-file-card')) { lastText = '[文件卡片]'; }
        lastTimeStr = this.formatMessageTime(lastRow.getAttribute('data-timestamp') || Date.now());
      }
      const previewEl = document.getElementById('preview-' + id); if(previewEl) previewEl.innerText = lastText;
      const chatItem = document.querySelector(`.chat-item[data-chat-id="chatScreen-${id}"]`);
      if (chatItem) { const timeEl = chatItem.querySelector('.chat-time'); if (timeEl) timeEl.innerText = lastTimeStr; }
    });
  },

  // 顺风耳更新名字：如果你改了人物名字或头像，它负责跑遍聊天框和消息列表，把上面显示的名字和头像全换掉。
  updateRoleNameDisplays(roleId) {
    const role = StateManager.getRole(roleId);
    if (!role) return;
    const name = role.remark || role.char.name || '?';
    const initial = Utils.getNameInitial(name);
    
    const chatScreen = document.getElementById(`chatScreen-${roleId}`);
    if (chatScreen) {
      const titleEl = chatScreen.querySelector('.detail-title');
      if (titleEl) titleEl.innerText = name;
    }
    
    const chatItem = document.querySelector(`.chat-item[data-chat-id="chatScreen-${roleId}"]`);
    if (chatItem) {
      const nameEl = chatItem.querySelector('.chat-name');
      if (nameEl) nameEl.innerText = name;
      
      const avatarEl = chatItem.querySelector('.avatar');
      if (avatarEl && avatarEl.tagName !== 'IMG') {
        if (role.avatarImage) {
          avatarEl.style.backgroundImage = `url(${role.avatarImage})`;
          avatarEl.style.backgroundSize = 'cover';
          avatarEl.style.backgroundPosition = 'center';
          avatarEl.innerText = '';
        } else if (roleId === 'shen_mian') {
          avatarEl.style.backgroundImage = `url(https://yun.jxnews.com.cn/sjfxt/image/6a3c87471052416d94933d66.png)`;
          avatarEl.style.backgroundSize = 'cover';
          avatarEl.style.backgroundPosition = 'center';
          avatarEl.innerText = '';
        } else {
          avatarEl.style.backgroundImage = 'none';
          avatarEl.innerText = name === 'character' ? 'C' : initial;
        }
      }
    }
  },
  
  // 小红点加一功能：来新消息了，把外面列表的小红点数字+1。
  accumulateUnread(chatId) {
    const roleId = chatId.replace('chatScreen-', '');
    const badge = document.getElementById('badge-' + roleId); if(!badge) return;
    badge.style.display = 'block'; badge.classList.remove('poof');
    if (badge._resetPhysics) badge._resetPhysics();
    badge.style.transform = 'translate(0px, 0px)';
    const badgeBg = badge.querySelector('.badge-bg'); if (badgeBg) badgeBg.style.transform = 'rotate(0rad) scaleX(1) scaleY(1)';
    const textEl = badge.querySelector('.badge-text'); if(textEl) textEl.innerText = parseInt(textEl.innerText || '0') + 1;
    localStorage.removeItem(badge.id);
  },
  
  // 底部导航滑动块：切换消息页面和联系人页面时，底部那个跟着跑的亮蓝色小光标。
  moveIndicator(item, isInitial = false) {
    const { currentActiveNav } = AppState.getState(); if (currentActiveNav) currentActiveNav.classList.remove('active');
    item.classList.add('active'); AppState.setState({ currentActiveNav: item });
    const indicator = this.DOM.indicator(); const navItems = Array.from(this.DOM.navItems());
    indicator.classList.toggle('warm-light', navItems.indexOf(item) === 2);
    const offset = (item.getBoundingClientRect().left - this.DOM.navBar().getBoundingClientRect().left) + (item.offsetWidth / 2) - (indicator.offsetWidth / 2);
    indicator.style.transform = `translateX(${offset}px)`;
    if (!isInitial) { indicator.classList.remove('shoot'); void indicator.offsetWidth; indicator.classList.add('shoot'); } else { indicator.classList.add('shoot'); }
    AppConfig.TABS.forEach((tabId, i) => document.getElementById(tabId).classList.toggle('active', i === navItems.indexOf(item)));
  },
  
  // 进门！打开你跟某个人的专属聊天窗口。顺便把未读的小红点消掉。
  openChat(chatId, itemEl) {
    const wrapper = itemEl?.closest('.chat-item-wrapper');
    if (wrapper && wrapper.dataset.swiped === 'true') { wrapper.style.transform = 'translateX(0)'; wrapper._currentX = 0; wrapper.dataset.swiped = 'false'; return; }
    document.getElementById('screenChatHome').classList.add('shrink');
    const targetChat = document.getElementById(chatId); const msgArea = targetChat.querySelector('.chat-messages');
    msgArea.style.scrollBehavior = 'auto'; msgArea.scrollTop = 99999; this.exitMultiSelect(chatId); 
    targetChat.classList.add('active'); AppState.setState({ currentChatId: chatId });
    if (itemEl) { const badge = itemEl.querySelector('.badge-container'); if (badge && !badge.classList.contains('poof')) { badge.style.display = 'none'; badge.querySelector('.badge-text').innerText = '0'; } }
    setTimeout(() => { msgArea.scrollTop = msgArea.scrollHeight; msgArea.style.scrollBehavior = 'smooth'; }, 300);
  },
  
  // 出门！关掉聊天窗口退回外面列表。
  closeChat() {
    document.getElementById('screenChatHome').classList.remove('shrink');
    const { currentChatId } = AppState.getState();
    if (currentChatId) { document.getElementById(currentChatId).classList.remove('active'); this.exitMultiSelect(currentChatId); AppState.setState({ currentChatId: null }); }
  },
  
  // 发消息的苦力：把你说的话（或者你要引用的别人的话），揉进聊天气泡的HTML代码里，然后硬生生塞到聊天屏幕里，并把屏幕滑到最底下让你看到。
  appendMessage(screenId, role, content, quoteText = null) {
    const roleId = screenId.replace('chatScreen-', '');
    const msgArea = document.getElementById(screenId).querySelector('.chat-messages'); const { ts, timeStr } = this.getMsgTimeInfo();
    
    // 对引用的文字进行转义防 XSS
    let safeQuoteText = quoteText ? Utils.escapeHTML(quoteText) : '';
    let quoteHtml = safeQuoteText ? `<div class="quote-ref" style="background:rgba(0,0,0,0.1); border-left:2px solid #f2c94c; padding:4px 8px; font-size:10px; margin-bottom:6px; border-radius:4px; color:rgba(0,0,0,0.5);">${safeQuoteText}</div>` : '';
    
    let leftAvatar = role === 'receiver' ? `<div class="avatar-col">${this.getAvatarHtml(false, roleId)}<span class="msg-time">${timeStr}</span></div>` : '';
    let rightAvatar = role === 'sender' ? `<div class="avatar-col">${this.getAvatarHtml(true)}<span class="msg-time">${timeStr}</span></div>` : '';
    
    // 对消息主体内容进行转义防 XSS，随后将换行符 \n 替换为 <br> 以保证格式
    let safeContent = Utils.escapeHTML(content).replace(/\n/g, '<br>');
    
    const html = `<div class="msg-row ${role}" data-timestamp="${ts}"><div class="msg-checkbox"></div><div class="multi-overlay"></div>${leftAvatar}<div class="msg-content"><div class="msg-bubble">${quoteHtml}${safeContent}</div></div>${rightAvatar}</div>`;
    msgArea.insertAdjacentHTML('beforeend', html); setTimeout(() => msgArea.scrollTop = msgArea.scrollHeight, 50); AppState.saveChatRecord(msgArea.id);
  },
  
  // 系统消息：比如撤回消息提示，也是这兄弟生成的。
  appendSysMsg(screenId, text) {
    const roleId = screenId.replace('chatScreen-', '');
    const msgArea = document.getElementById(screenId).querySelector('.chat-messages'); const { ts, timeStr } = this.getMsgTimeInfo();
    const html = `<div class="msg-row receiver sys-msg" data-timestamp="${ts}"><div class="avatar-col">${this.getAvatarHtml(false, roleId)}<span class="msg-time">${timeStr}</span></div><div class="msg-content"><div class="msg-bubble">${Utils.escapeHTML(text)}</div></div></div>`;
    msgArea.insertAdjacentHTML('beforeend', html); setTimeout(() => msgArea.scrollTop = msgArea.scrollHeight, 50); AppState.saveChatRecord(msgArea.id);
    if (!document.getElementById(screenId).classList.contains('active')) this.accumulateUnread(screenId);
  },
  
  // 把表情包贴在某句话上（贴贴功能）。
  addReactionToRow(row, emoji) {
    let wrap = row.querySelector('.msg-content .msg-reactions'); 
    if(!wrap) { wrap = document.createElement('div'); wrap.className = 'msg-reactions'; row.querySelector('.msg-content').appendChild(wrap); }
    let found = Array.from(wrap.querySelectorAll('.reaction-tag')).find(t => t.getAttribute('data-emoji') === emoji || t.innerText.includes(emoji));
    if(found) { if (!found.hasAttribute('data-emoji')) found.setAttribute('data-emoji', emoji); let count = parseInt(found.getAttribute('data-count') || 1) + 1; found.innerHTML = emoji; found.setAttribute('data-count', count); } 
    else { wrap.insertAdjacentHTML('beforeend', `<span class="reaction-tag" data-action="reaction-click" data-count="1" data-emoji="${emoji}">${emoji}</span>`); }
    AppState.saveChatRecord(row.closest('.chat-messages').id);
  },
  
  // 隐藏掉所有乱七八糟的悬浮菜单和表情框。
  hideAllFloatMenus() {
    const { menuFadeTimer } = AppState.getState(); this.DOM.contextMenu().classList.remove('show'); this.DOM.inlinePicker().classList.remove('show', 'expanded');
    if (menuFadeTimer) clearTimeout(menuFadeTimer);
    AppState.setState({ menuFadeTimer: setTimeout(() => { if (!this.DOM.contextMenu().classList.contains('show')) AppState.setState({ activeTargetRow: null }); }, 200) });
  },
  
  // 长按消息黑科技！当你长按某句话，它负责算好屏幕位置，然后“啪”的一下，在你手指旁边弹出一个包含复制、撤回的小黑菜单。
  showMenusForRow(row) {
    if (row.closest('.screen-chat').classList.contains('multi-select-mode')) { row.classList.toggle('selected'); this.updateMsCount(row.closest('.screen-chat')); return; }
    const isSender = row.classList.contains('sender'); const bubble = row.querySelector('.msg-bubble') || row.querySelector('.msg-file-card') || row; const rect = bubble.getBoundingClientRect(); const frameRect = document.querySelector('.phone-frame').getBoundingClientRect(); const top = rect.top - frameRect.top; const left = rect.left - frameRect.left;
    const { menuFadeTimer } = AppState.getState(); if (menuFadeTimer) { clearTimeout(menuFadeTimer); AppState.setState({ menuFadeTimer: null }); }
    AppState.setState({ activeTargetRow: row, menuJustOpened: true }); setTimeout(() => AppState.setState({ menuJustOpened: false }), 300);
    const mkItem = (text, icon, color, action) => `<div class="menu-action" data-action="${action}"><div class="menu-icon-placeholder"><img src="${icon}" style="width:16px;height:16px;object-fit:contain; filter: ${color==='#ff4d4f'?'none':'brightness(0) invert(1)'}; pointer-events:none;"></div><span style="color:${color}; pointer-events:none;">${text}</span></div>`;
    const ctxMenu = this.DOM.contextMenu(); const inlPicker = this.DOM.inlinePicker(); ctxMenu.innerHTML = '';
    if (isSender) { 
      ctxMenu.innerHTML = mkItem('撤回', AppConfig.ICONS.recall, '#fff', 'menu-recall') + mkItem('复制', AppConfig.ICONS.copy, '#fff', 'menu-copy') + mkItem('多选', AppConfig.ICONS.select, '#fff', 'menu-multi') + mkItem('删除', AppConfig.ICONS.delete, '#ff4d4f', 'menu-delete') + mkItem('编辑', AppConfig.ICONS.edit, '#fff', 'menu-edit') + mkItem('收藏', AppConfig.ICONS.favorite, '#fff', 'menu-favorite'); 
      ctxMenu.style.top = `${top - 44}px`; ctxMenu.style.left = `${Math.max(10, left + rect.width - 240)}px`; inlPicker.classList.remove('show'); 
    } else { 
      ctxMenu.innerHTML = mkItem('引用', AppConfig.ICONS.quote, '#fff', 'menu-quote') + mkItem('复制', AppConfig.ICONS.copy, '#fff', 'menu-copy') + mkItem('多选', AppConfig.ICONS.select, '#fff', 'menu-multi') + mkItem('删除', AppConfig.ICONS.delete, '#ff4d4f', 'menu-delete') + mkItem('编辑', AppConfig.ICONS.edit, '#fff', 'menu-edit') + mkItem('收藏', AppConfig.ICONS.favorite, '#fff', 'menu-favorite'); 
      let leftPos = Math.min(left, frameRect.width - 10 - 240); inlPicker.style.top = `${top - 44}px`; inlPicker.style.left = `${leftPos}px`; inlPicker.classList.add('show'); ctxMenu.style.top = `${top + rect.height + 8}px`; ctxMenu.style.left = `${leftPos}px`; 
    }
    ctxMenu.classList.add('show');
  },
  
  // 开启/关闭多选模式：在所有消息旁边画一个小圆圈圈让你勾选。
  toggleMultiSelect() {
    this.hideAllFloatMenus(); const { activeTargetRow } = AppState.getState(); let s = activeTargetRow ? activeTargetRow.closest('.screen-chat') : document.querySelector('.screen-chat.active'); if(!s) return; 
    if(!s.classList.contains('multi-select-mode')) { s.classList.add('multi-select-mode'); s.querySelectorAll('.msg-row').forEach(r => { if(!r.querySelector('.msg-checkbox')) r.insertAdjacentHTML('afterbegin','<div class="msg-checkbox"></div><div class="multi-overlay"></div>'); r.classList.remove('selected'); }); if(activeTargetRow) activeTargetRow.classList.add('selected'); this.updateMsCount(s); } else this.exitMultiSelect(s.id);
  },
  exitMultiSelect(sid) { let s = sid ? document.getElementById(sid) : document.querySelector('.screen-chat.active'); if(s) { s.classList.remove('multi-select-mode'); s.querySelectorAll('.msg-row').forEach(r => r.classList.remove('selected')); } },
  updateMsCount(s) { s.querySelectorAll('.ms-count').forEach(el => el.innerText = s.querySelectorAll('.msg-row.selected').length); },
  
  // 表情包拖拽重排黑科技：这是一个让元素移动时有过渡动画的高级算法(FLIP)，让表情换位置时看起来丝滑柔顺。
  doFLIPRender(updateFn) {
    const grid = this.DOM.reactionGrid(); const oldRects = new Map(); Array.from(grid.children).forEach(el => oldRects.set(el.dataset.emoji || el.id || el.className, el.getBoundingClientRect()));
    updateFn();
    requestAnimationFrame(() => {
      Array.from(grid.children).forEach(el => {
        const old = oldRects.get(el.dataset.emoji || el.id || el.className); if (!old) return; const cur = el.getBoundingClientRect(); const dx = old.left - cur.left; const dy = old.top - cur.top;
        if (dx !== 0 || dy !== 0) { el.style.transition = 'none'; el.style.transform = `translate(${dx}px, ${dy}px)`; requestAnimationFrame(() => { el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'; el.style.transform = ''; setTimeout(() => el.style.transition = '', 300); }); }
      });
    });
  },
  
  // 画表情包面板：把你记忆库里的那些笑脸、红心等符号画到输入框上面的盒子里。
  renderReactionGrid() {
    const grid = this.DOM.reactionGrid(); const { customEmojis } = AppState.getState(); grid.innerHTML = '';
    const buildCell = (em, idx) => `<div class="reaction-cell draggable-emoji" data-index="${idx}" data-emoji="${em}" data-action="pick-reaction"><div class="reaction-icon-box pointer-events-none">${em}</div></div>`;
    for(let i=0; i<7 && i<customEmojis.length; i++) grid.insertAdjacentHTML('beforeend', buildCell(customEmojis[i], i));
    grid.insertAdjacentHTML('beforeend', `<div class="reaction-cell" data-action="toggle-expand-reactions"><div class="reaction-icon-box expand-btn-box pointer-events-none"><img src="icons/chevron.svg" style="width:14px;height:14px;transition:transform 0.3s;"></div></div>`);
    for(let i=7; i<customEmojis.length; i++) grid.insertAdjacentHTML('beforeend', buildCell(customEmojis[i], i));
    grid.insertAdjacentHTML('beforeend', `<div class="reaction-cell" id="addEmojiCell" data-action="show-inline-input"><div class="reaction-icon-box pointer-events-none" style="background: rgba(255,255,255,0.15); font-weight:bold; color:rgba(255,255,255,0.9);">+</div></div>`);
  },
  
  // 开设私人包厢！你在通讯录新点了一个人，它就吭哧吭哧给你俩在消息列表里加个条目，并单独建一整套聊天框出来。
  createChatWindow(roleId) {
    if (document.getElementById(`chatScreen-${roleId}`)) return;
    const role = StateManager.getRole(roleId);
    if (!role) return;

    // 1. 创建外面的消息列表条目
    const chatList = document.querySelector('.chat-list');
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-item-wrapper';
    const name = role.remark || role.char.name || '?';
    const initial = Utils.getNameInitial(name);
    
    let avatarHtml = '';
    if (role.avatarImage) {
      avatarHtml = `<div class="avatar" style="background-image: url(${role.avatarImage}); background-size: cover; background-position: center;"></div>`;
    } else if (roleId === 'shen_mian') {
      avatarHtml = `<img src="https://yun.jxnews.com.cn/sjfxt/image/6a3c87471052416d94933d66.png" class="avatar" alt="Avatar">`;
    } else {
      avatarHtml = `<div class="avatar" style="display:flex; justify-content:center; align-items:center; font-size:18px; font-weight:bold; color:#fff; background:rgba(255,255,255,0.1);">${initial}</div>`;
    }

    wrapper.innerHTML = `
      <div class="chat-item" data-action="open-chat" data-chat-id="chatScreen-${roleId}">
        ${avatarHtml}
        <div class="chat-info">
          <div class="chat-name">${name}</div>
          <div class="chat-msg-preview" id="preview-${roleId}">暂无消息</div>
        </div>
        <div class="chat-meta">
          <div class="chat-time"></div>
          <div class="badge-container" id="badge-${roleId}" style="display: none;">
            <div class="badge-bg"></div><div class="badge-text">0</div>
          </div>
        </div>
      </div>
      <div class="swipe-actions">
        <div class="swipe-action swipe-pin">置顶</div>
        <div class="swipe-action swipe-unread">标为未读</div>
        <div class="swipe-action swipe-delete">删除</div>
      </div>
    `;
    chatList.appendChild(wrapper);
    AppEvents.initSwipeActions(document);
    this.initBadgePhysics(wrapper); // 给这个条目的小红点加上果冻物理特效

    // 2. 创建里面真实的独立聊天窗口
    const templateChat = document.getElementById('tpl-chat-screen');
    const newChat = templateChat.content.cloneNode(true).querySelector('.screen-chat');
    newChat.id = `chatScreen-${roleId}`;
    
    newChat.querySelector('.detail-title').innerText = name;
    
    const msgArea = newChat.querySelector('.chat-messages');
    msgArea.id = `msgArea-${roleId}`;
    
    document.querySelector('.phone-frame').appendChild(newChat);

    msgArea.addEventListener('scroll', () => {
      if (AppState.getState().activeTargetRow && AppUI.DOM.contextMenu().classList.contains('show')) AppUI.hideAllFloatMenus();
    }, {passive: true});
  },
  
  // 物理特效黑科技！专门实现列表上那个消息“红点”像软糖果冻一样，可以被你拽出来、拉扯变形、放手还会回弹或者“噗”一下消失的神奇效果。
  initBadgePhysics(container = document) {
    container.querySelectorAll('.badge-container').forEach(badge => {
      if (badge._resetPhysics) return;
      const bg = badge.querySelector('.badge-bg'); let drag = false, sx = 0, sy = 0, tx = 0, cy = 0, cx = 0, vx = 0, vy = 0, anim, ty = 0;
      badge._resetPhysics = () => { tx=0; ty=0; cx=0; cy=0; vx=0; vy=0; if(anim) cancelAnimationFrame(anim); };
      const loop = () => {
        if(drag || Math.abs(vx)>0.01 || Math.abs(cx)>0.01 || Math.abs(vy)>0.01 || Math.abs(cy)>0.01) {
          let dx = tx - cx, dy = ty - cy, dist = Math.sqrt(dx*dx + dy*dy); 
          if(dist > 15) { cx = tx - (dx/dist)*15; cy = ty - (dy/dist)*15; }
          vx += (tx-cx)*0.5 - vx*0.4; vy += (ty-cy)*0.5 - vy*0.4; cx += vx; cy += vy;
          bg.style.transform = `rotate(${Math.atan2(vy, vx)}rad) scaleX(${1 + Math.min(Math.sqrt(vx*vx+vy*vy)/25, 0.35)}) scaleY(${1 - Math.min(Math.sqrt(vx*vx+vy*vy)/25, 0.35)*0.4})`;
          badge.style.transform = `translate(${cx}px, ${cy}px)`; anim = requestAnimationFrame(loop);
        } else { bg.style.transform = 'rotate(0rad) scaleX(1) scaleY(1)'; badge.style.transform = 'translate(0px, 0px)'; }
      };
      const handleDragStart = (e) => { e.stopPropagation(); drag = true; const t = AppUI.getTouch(e); sx = t.clientX; sy = t.clientY; tx = 0; ty = 0; cx = 0; cy = 0; vx = 0; vy = 0; if(anim) cancelAnimationFrame(anim); loop(); document.addEventListener('mousemove', handleDragMove); document.addEventListener('mouseup', handleDragEnd); document.addEventListener('touchmove', handleDragMove, {passive:false}); document.addEventListener('touchend', handleDragEnd); };
      const handleDragMove = (e) => { if(!drag) return; e.preventDefault(); const t = AppUI.getTouch(e); tx = t.clientX - sx; ty = t.clientY - sy; };
      const handleDragEnd = (e) => { if(!drag) return; drag = false; document.removeEventListener('mousemove', handleDragMove); document.removeEventListener('mouseup', handleDragEnd); document.removeEventListener('touchmove', handleDragMove); document.removeEventListener('touchend', handleDragEnd); const t = AppUI.getTouch(e); const r = badge.closest('.chat-item')?.getBoundingClientRect(); if(!r || !(t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom)){ badge.classList.add('poof'); setTimeout(() => { badge.style.display = 'none'; badge.querySelector('.badge-text').innerText = '0'; }, 300); if(badge.id) localStorage.setItem(badge.id, 'poofed'); } else { tx = 0; ty = 0; } };
      badge.addEventListener('mousedown', handleDragStart); badge.addEventListener('touchstart', handleDragStart, {passive:false});
    });
  }
};

/**
 * ==========================================
 * AppAPI 模块 (AI替身演员工)
 * 说明：因为现在是纯网页离线版，没有接入真正的AI大脑。
 * 它的作用就是：当你发完一条消息，它假装“正在输入...”，转个圈圈，
 * 等过个1.5秒后给你回一句敷衍的固定话术。纯纯的演技派！
 * ==========================================
 */
const AppAPI = {
  async triggerAIResponse(screenId) {
    const { isAITyping } = AppState.getState(); if(isAITyping) return;
    const roleId = screenId.replace('chatScreen-', '');
    const msgArea = document.getElementById('msgArea-' + roleId); 
    if(!msgArea) return;
    AppState.setState({ isAITyping: true });

    // 假装正在输入中（发出一个带三个小点点的动画气泡）
    const loadId = 'loading-' + Date.now(); const { ts, timeStr } = AppUI.getMsgTimeInfo();
    msgArea.insertAdjacentHTML('beforeend', `<div class="msg-row receiver" id="${loadId}" data-timestamp="${ts}"><div class="msg-checkbox"></div><div class="multi-overlay"></div><div class="avatar-col"><div class="avatar-wrap loading">${AppUI.getAvatarHtml(false, roleId)}</div><span class="msg-time">${timeStr}</span></div><div class="msg-content"><div class="msg-bubble" style="padding: 12px 14px;"><div class="typing-indicator"><span></span><span></span><span></span></div></div></div></div>`); msgArea.scrollTop = msgArea.scrollHeight;

    // 假装思考1.5秒钟...
    await new Promise(r => setTimeout(r, 1500)); 
    let reply = "【离线模式】API设置已被完全移除，当前为纯展示状态。";

    // 思考完毕，把刚才的输入中气泡替换成它回答的话
    let node = document.getElementById(loadId);
    if(node) { node.querySelector('.avatar-wrap').classList.remove('loading'); node.querySelector('.msg-content').innerHTML = `<div class="msg-bubble" style="animation: slideUpMsg 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;">${reply}</div>`; node.id = ''; }
    msgArea.scrollTop = msgArea.scrollHeight; AppState.saveChatRecord(msgArea.id);
    if (!document.getElementById(screenId).classList.contains('active')) AppUI.accumulateUnread(screenId);

    AppState.setState({ isAITyping: false });
  }
};

/**
 * ==========================================
 * AppEvents 模块 (全局动作指令大总管)
 * 说明：统管聊天界面的所有鼠标点击、键盘敲击和手指滑动！
 * 它就像一个接线员，看到你点了“发送”按钮，就跑去告诉发消息的功能；看到你往左滑，就跑去告诉左滑删除功能。
 * ==========================================
 */
const AppEvents = {
  // 把所有的动作监听都打开！
  init() {
    document.body.addEventListener('click', this.handleClick.bind(this)); document.body.addEventListener('keypress', this.handleKeypress.bind(this)); document.body.addEventListener('focusout', this.handleFocusout.bind(this));
    document.body.addEventListener('mousedown', this.handlePressStart.bind(this)); document.body.addEventListener('touchstart', this.handlePressStart.bind(this), {passive: true});
    this.initSwipeActions(); this.initEmojiDrag();
  },
  
  // 处理你的各种点击：点哪里它都能认出来你是想干嘛（发消息、引用、多选、切换页面等等）。
  handleClick(e) {
    const { menuJustOpened, activeTargetRow, isDraggingEmoji, currentQuoteText } = AppState.getState();
    if (menuJustOpened) return;
    if (e.target.classList.contains('multi-overlay')) { let r = e.target.closest('.msg-row'); if(r) { r.classList.toggle('selected'); AppUI.updateMsCount(r.closest('.screen-chat')); } return; }
    if (!e.target.closest('.msg-context-menu') && !e.target.closest('.inline-reaction-picker') && !e.target.closest('.ms-toolbar')) AppUI.hideAllFloatMenus();
    
    // 如果你点了红色的“删除”按钮（消息列表左滑出来的那个），它就用极其丝滑的动画把聊天框删掉。
    if (e.target.classList.contains('swipe-delete')) {
      const wrapper = e.target.closest('.chat-item-wrapper');
      const chatId = wrapper.querySelector('.chat-item').dataset.chatId;
      const roleId = chatId.replace('chatScreen-', '');
      
      // 先固定当前高度，准备进行平滑坍塌
      wrapper.style.maxHeight = wrapper.offsetHeight + 'px';
      // 强制重绘以应用当前高度
      void wrapper.offsetWidth;
      
      // 防止收缩时内容溢出
      wrapper.style.overflow = 'hidden';
      
      // 丝滑动画策略：先让条目继续向左彻底滑出并淡出，稍微延迟后开始收缩高度和外边距
      wrapper.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease, max-height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s, margin-bottom 0.3s ease 0.15s';
      
      // 触发最终动画状态
      wrapper.style.transform = 'translateX(-120%)';
      wrapper.style.opacity = '0';
      wrapper.style.marginBottom = '0';
      wrapper.style.maxHeight = '0';
      
      setTimeout(() => {
        wrapper.remove();
        const screen = document.getElementById(chatId);
        if (screen) screen.remove();
        localStorage.removeItem('msgArea-' + roleId);
      }, 450); // 等待完整的缓动周期结束
      return;
    }

    const actionEl = e.target.closest('[data-action]'); if (!actionEl) return;
    const action = actionEl.dataset.action;
    // 下面就是接线员在分配任务，各种 switch-case 就像转接台
    switch(action) {
      case 'switch-tab': AppUI.moveIndicator(actionEl); break;
      case 'open-chat': AppUI.openChat(actionEl.dataset.chatId, actionEl); break;
      case 'close-chat': AppUI.closeChat(); break;
      case 'exit-ms': AppUI.exitMultiSelect(); break;
      case 'send-message': this._actions.handleSendClick(actionEl.closest('.screen-chat').id); break;
      case 'reaction-click': this._actions.handleReactionClick(actionEl, e); break;
      case 're-edit-text': let inp = actionEl.closest('.screen-chat').querySelector('.msg-input'); if(inp) { inp.value = actionEl.dataset.text; inp.focus(); } break;
      case 'close-quote': actionEl.closest('.quote-bar').style.display = 'none'; AppState.setState({currentQuoteText: ""}); break;
      case 'pick-reaction': if(!isDraggingEmoji && activeTargetRow) { AppUI.addReactionToRow(activeTargetRow, actionEl.dataset.emoji); AppUI.hideAllFloatMenus(); } break;
      case 'toggle-expand-reactions': e.stopPropagation(); AppUI.DOM.inlinePicker().classList.toggle('expanded'); break;
      case 'show-inline-input': this._actions.showInlineInput(actionEl, e); break;
      case 'trigger-image-picker': document.getElementById('imagePicker').click(); break;
      case 'menu-recall': this._actions.recallMessage(); break;
      case 'menu-copy': case 'copy-msg': if(activeTargetRow && navigator.clipboard) navigator.clipboard.writeText(activeTargetRow.querySelector('.msg-bubble')?.innerText || ''); AppUI.hideAllFloatMenus(); break;
      case 'menu-multi': AppUI.toggleMultiSelect(); break;
      case 'menu-delete': if(activeTargetRow) { let r = activeTargetRow; r.style.maxHeight = r.scrollHeight + 'px'; void r.offsetWidth; r.classList.add('deleting'); setTimeout(() => { let msgId = r.closest('.chat-messages').id; r.remove(); AppState.saveChatRecord(msgId); }, 300); } AppUI.hideAllFloatMenus(); break;
      case 'menu-edit': case 'edit-msg': this._actions.editMessage(); break;
      case 'menu-favorite': case 'favorite-msg': AppUI.hideAllFloatMenus(); break;
      case 'menu-quote': case 'quote-msg': this._actions.quoteMessage(); break;
      case 'ms-delete-msg': let s = document.querySelector('.screen-chat.active'); if(!s) return; let rs = s.querySelectorAll('.msg-row.selected'); rs.forEach(r => { r.style.maxHeight = r.scrollHeight + 'px'; void r.offsetWidth; r.classList.add('deleting'); }); AppUI.exitMultiSelect(s.id); setTimeout(() => { rs.forEach(r => r.remove()); AppState.saveChatRecord(s.querySelector('.chat-messages').id); }, 300); break;
    }
  },
  
  // 监听敲键盘：你在输入框按了回车键（Enter），它就帮你发消息。
  handleKeypress(e) { if(e.key === 'Enter' && e.target.classList.contains('msg-input')) this._actions.handleSendClick(e.target.closest('.screen-chat').id); },
  handleFocusout(e) { if (e.target.classList.contains('msg-bubble') && e.target.classList.contains('editing')) { e.target.contentEditable = "false"; e.target.classList.remove('editing'); AppState.saveChatRecord(e.target.closest('.chat-messages').id); } },
  
  // 监听长按：如果你按在某句话上不动超过0.4秒，它就通知UI包工头弹那个小黑菜单。
  handlePressStart(e) {
    if(e.target.closest('.reaction-tag') || e.target.closest('.draggable-emoji') || e.target.closest('.mini-ticket-container') || e.target.closest('.ticket-modal-overlay')) return; 
    let row = e.target.closest('.msg-row'); if(!row || row.querySelector('.typing-indicator') || row.closest('.screen-chat').classList.contains('multi-select-mode')) return;
    const touch = AppUI.getTouch(e); let sx = touch.clientX, sy = touch.clientY;
    AppState.setState({ pressTimer: setTimeout(() => { if (AppUI.DOM.contextMenu().classList.contains('show')) { AppUI.hideAllFloatMenus(); setTimeout(() => AppUI.showMenusForRow(row), 150); } else { AppUI.showMenusForRow(row); } }, 400) });
    const moveHandler = (ev) => { const t = AppUI.getTouch(ev); if(Math.abs(t.clientX - sx) > 10 || Math.abs(t.clientY - sy) > 10) clearPress(); };
    const clearPress = () => { const { pressTimer } = AppState.getState(); if(pressTimer) { clearTimeout(pressTimer); AppState.setState({ pressTimer: null }); } document.removeEventListener('mousemove', moveHandler); document.removeEventListener('mouseup', clearPress); document.removeEventListener('touchmove', moveHandler); document.removeEventListener('touchend', clearPress); };
    document.addEventListener('mousemove', moveHandler); document.addEventListener('mouseup', clearPress); document.addEventListener('touchmove', moveHandler, {passive: true}); document.addEventListener('touchend', clearPress);
  },
  
  // 具体各种动作的执行小分队
  _actions: {
    handleSendClick(screenId) {
      const screen = document.getElementById(screenId); const input = screen.querySelector('.msg-input'); const val = input.value.trim(); let { currentQuoteText } = AppState.getState();
      if (val === '') { AppAPI.triggerAIResponse(screenId); } else { AppUI.appendMessage(screenId, 'sender', val, currentQuoteText); input.value = ''; AppState.setState({ currentQuoteText: "" }); }
      if (screen.querySelector('.quote-bar').style.display !== 'none') screen.querySelector('.quote-bar').style.display = 'none';
    },
    handleReactionClick(el, e) {
      e.stopPropagation(); if(el.closest('.sys-msg')) return; let count = parseInt(el.getAttribute('data-count') || 1);
      if (count > 1) { el.setAttribute('data-count', --count); AppState.saveChatRecord(el.closest('.chat-messages').id); } else { el.style.pointerEvents = 'none'; el.classList.add('deleting-reaction'); setTimeout(() => { let wrap = el.closest('.msg-reactions'); let msgArea = el.closest('.chat-messages'); el.remove(); if (wrap && wrap.children.length === 0) wrap.remove(); if (msgArea) AppState.saveChatRecord(msgArea.id); }, 300); }
    },
    recallMessage() {
      const { activeTargetRow } = AppState.getState(); if(!activeTargetRow) return;
      let bubble = activeTargetRow.querySelector('.msg-bubble'); if (!bubble) return; let clone = bubble.cloneNode(true); clone.querySelectorAll('.quote-ref, div[style*="border-left: 2px solid #f2c94c"]').forEach(q => q.remove()); let t = clone.innerText.trim(); 
      activeTargetRow.className = 'msg-row sys-msg'; activeTargetRow.style.justifyContent = 'center'; 
      
      // 对文本内容进行 XSS 转义，防止直接注入攻击
      let safeT = Utils.escapeHTML(t);
      activeTargetRow.innerHTML = `<div class="msg-content" style="max-width: 100%; align-items: center;"><div class="msg-bubble sys-recall-bubble" style="background: transparent; border: none; color: rgba(255,255,255,0.5); font-size: 11px; white-space: nowrap; padding: 4px;">你 撤回了一条消息 <span data-action="re-edit-text" data-text="${safeT}" style="color: #4a90e2; cursor: pointer; margin-left: 4px;">重新编辑</span></div></div>`; 
      AppUI.hideAllFloatMenus(); AppState.saveChatRecord(activeTargetRow.closest('.chat-messages').id);
    },
    editMessage() {
      const { activeTargetRow } = AppState.getState(); if(!activeTargetRow) return; let b = activeTargetRow.querySelector('.msg-bubble'); if(!b) return; 
      b.contentEditable = "true"; b.classList.add('editing'); 
      setTimeout(() => { b.focus(); let r = document.createRange(); let s = window.getSelection(); r.selectNodeContents(b); r.collapse(false); s.removeAllRanges(); s.addRange(r); }, 50); 
      AppUI.hideAllFloatMenus(); b.addEventListener('keydown', (e) => { if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); b.blur(); } });
    },
    quoteMessage() {
      const { activeTargetRow } = AppState.getState(); if(!activeTargetRow) return; let b = activeTargetRow.querySelector('.msg-bubble') || activeTargetRow.querySelector('.file-info'); if(!b) return; 
      let t = b.innerText; let currentQuoteText = t.length > 25 ? t.substring(0, 25) + '...' : t; AppState.setState({ currentQuoteText });
      let scr = activeTargetRow.closest('.screen-chat'); let q = scr.querySelector('.quote-bar'); 
      
      // 在填充 quote-bar 的 innerHTML 之前进行安全转义处理
      let safeQuote = Utils.escapeHTML(currentQuoteText);
      q.innerHTML = `<div class="quote-content" style="border-left: 2px solid #f2c94c; padding-left: 8px; color: rgba(255,255,255,0.7); font-size: 11px;"><div style="font-size: 9px; opacity:0.5; margin-bottom:2px;">引用</div>${safeQuote}</div><div data-action="close-quote" style="cursor:pointer; color: rgba(255,255,255,0.5); padding: 4px;">×</div>`; 
      q.style.display = 'flex'; AppUI.hideAllFloatMenus(); scr.querySelector('.msg-input').focus();
    },
    showInlineInput(actionEl, e) {
      e.stopPropagation(); actionEl.innerHTML = `<div class="reaction-icon-box pointer-events-none" style="background: rgba(255,255,255,0.15); border-radius: 4px; overflow: hidden;"><input type="text" id="inlineEmojiInput" style="width:100%; height:100%; background:transparent; border:none; color:#fff; text-align:center; font-size:12px; outline:none; padding:0; user-select:auto !important; -webkit-user-select:auto !important; pointer-events:auto;"/></div>`; 
      const inp = document.getElementById('inlineEmojiInput'); setTimeout(() => inp.focus(), 50); 
      const fn = () => { const v = inp.value.trim(); if(v) { AppUI.doFLIPRender(() => { const state = AppState.getState(); state.customEmojis = state.customEmojis.filter(x => x !== v); state.customEmojis.push(v); AppState.saveEmojis(); AppUI.renderReactionGrid(); }); } else { AppUI.renderReactionGrid(); } }; 
      inp.addEventListener('blur', fn); inp.addEventListener('keydown', (ev) => { if(ev.key === 'Enter') { inp.removeEventListener('blur', fn); fn(); } });
    }
  },
  
  // 消息列表左滑删除的魔法：负责监听你的手指在别人头像上是不是往左滑动了，滑了就漏出红色按钮。
  initSwipeActions(container = document) {
    const targets = container.classList && container.classList.contains('chat-item-wrapper') ? [container] : container.querySelectorAll('.chat-item-wrapper');
    targets.forEach(wrapper => {
      if (wrapper._swipeBound) return;
      wrapper._swipeBound = true;
      wrapper._currentX = 0; let startX = 0, startY = 0, isDragging = false;
      wrapper.addEventListener('touchstart', (e) => {
        document.querySelectorAll('.chat-item-wrapper').forEach(w => { if (w !== wrapper && w.dataset.swiped === 'true') { w.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'; w.style.transform = `translateX(0)`; w._currentX = 0; w.dataset.swiped = 'false'; } });
        startX = e.touches[0].clientX; startY = e.touches[0].clientY; isDragging = true; wrapper.style.transition = 'none';
      }, {passive: true});
      wrapper.addEventListener('touchmove', (e) => { if (!isDragging) return; let dx = e.touches[0].clientX - startX; let dy = e.touches[0].clientY - startY; if (Math.abs(dy) > Math.abs(dx) && wrapper._currentX === 0) { isDragging = false; return; } e.preventDefault(); let tx = wrapper._currentX + dx; wrapper.style.transform = `translateX(${Math.max(-200, Math.min(0, tx))}px)`; }, {passive: false});
      wrapper.addEventListener('touchend', (e) => { if (!isDragging) return; isDragging = false; wrapper._currentX += e.changedTouches[0].clientX - startX; wrapper.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'; if (wrapper._currentX < -60) { wrapper._currentX = -180; wrapper.dataset.swiped = 'true'; } else { wrapper._currentX = 0; setTimeout(() => wrapper.dataset.swiped = 'false', 50); } wrapper.style.transform = `translateX(${wrapper._currentX}px)`; });
    });
  },
  
  // 拖拽表情包的魔法：按住下面的emoji，像变魔术一样拖出一个影子贴在消息上。
  initEmojiDrag() {
    let emojiGhost = null, startX, startY; const grid = AppUI.DOM.reactionGrid();
    const handleDragStart = (e) => { const tgt = e.target.closest('.draggable-emoji'); if(!tgt) return; AppState.setState({ dragSrcIndex: parseInt(tgt.dataset.index), isDraggingEmoji: false }); const t = AppUI.getTouch(e); startX = t.clientX; startY = t.clientY; AppState.setState({ emojiDragTimer: setTimeout(() => { AppState.setState({ isDraggingEmoji: true }); tgt.style.opacity = '0.3'; emojiGhost = tgt.cloneNode(true); emojiGhost.style.cssText = 'position:fixed; opacity:0.9; pointer-events:none; z-index:9999; transform:scale(1.2); transition:transform 0.1s;'; const r = tgt.getBoundingClientRect(); emojiGhost.style.width = r.width + 'px'; emojiGhost.style.height = r.height + 'px'; emojiGhost.style.left = r.left + 'px'; emojiGhost.style.top = r.top + 'px'; document.body.appendChild(emojiGhost); document.body.style.userSelect = 'none'; }, 200) }); };
    const handleDragMove = (e) => { const { isDraggingEmoji, dragSrcIndex, emojiDragTimer } = AppState.getState(); if(!isDraggingEmoji) { const t = AppUI.getTouch(e); if(dragSrcIndex !== null && (Math.abs(t.clientX - startX) > 10 || Math.abs(t.clientY - startY) > 10)) { clearTimeout(emojiDragTimer); } return; } e.preventDefault(); const t = AppUI.getTouch(e); if(emojiGhost) { emojiGhost.style.left = (t.clientX - emojiGhost.offsetWidth / 2) + 'px'; emojiGhost.style.top = (t.clientY - emojiGhost.offsetHeight / 2) + 'px'; } const overCell = document.elementFromPoint(t.clientX, t.clientY)?.closest('.draggable-emoji'); document.querySelectorAll('.draggable-emoji').forEach(el => el.classList.remove('drag-target')); if(overCell && overCell.dataset.index !== String(dragSrcIndex)) { overCell.classList.add('drag-target'); } };
    const handleDragEnd = (e) => { const { isDraggingEmoji, dragSrcIndex, emojiDragTimer, customEmojis } = AppState.getState(); clearTimeout(emojiDragTimer); const tgt = dragSrcIndex !== null ? document.querySelector(`.draggable-emoji[data-index="${dragSrcIndex}"]`) : null; if(!isDraggingEmoji) { AppState.setState({dragSrcIndex: null}); return; } document.body.style.userSelect = ''; if(emojiGhost) { emojiGhost.remove(); emojiGhost = null; } if(tgt) tgt.style.opacity = '1'; const t = AppUI.getTouch(e); const pR = AppUI.DOM.inlinePicker().getBoundingClientRect(); const isOut = (t.clientX < pR.left || t.clientX > pR.right || t.clientY < pR.top || t.clientY > pR.bottom); const overCell = document.elementFromPoint(t.clientX, t.clientY)?.closest('.draggable-emoji'); if(isOut) { AppUI.doFLIPRender(() => { customEmojis.splice(dragSrcIndex, 1); AppState.saveEmojis(); AppUI.renderReactionGrid(); }); } else if(overCell && overCell.dataset.index !== String(dragSrcIndex)) { const tIdx = parseInt(overCell.dataset.index); AppUI.doFLIPRender(() => { const item = customEmojis.splice(dragSrcIndex, 1)[0]; customEmojis.splice(tIdx, 0, item); AppState.saveEmojis(); AppUI.renderReactionGrid(); }); } else { document.querySelectorAll('.draggable-emoji').forEach(el => el.classList.remove('drag-target')); } AppState.setState({ dragSrcIndex: null }); setTimeout(() => AppState.setState({ isDraggingEmoji: false }), 50); };
    grid.addEventListener('touchstart', handleDragStart, {passive:false}); grid.addEventListener('mousedown', handleDragStart); document.addEventListener('touchmove', handleDragMove, {passive:false}); document.addEventListener('mousemove', handleDragMove); document.addEventListener('touchend', handleDragEnd); document.addEventListener('mouseup', handleDragEnd);
  }
};


/**
 * ==========================================
 * GlobalApp 模块 (终极大老板：全局入口)
 * 说明：App启动的唯一开关！当整个网页终于加载完毕后，它第一个站出来，
 * 把上面的管家婆、总管、包工头全部叫醒，告诉他们：“开始按顺序干活啦！”
 * ==========================================
 */
const GlobalApp = {
  // 启动所有工序！
  init() {
    // 1. 初始化联系人与状态
    StateManager.init();
    ContactsController.renderList();
    ContactsEventManager.bindAll();
    ScrollBounceController.init();
    AppState.init();

    // 0. 兼容并迁移老数据 (把以前的 msgArea-1 那些老数据迁移成 shen_mian)
    const oldMsgArea = localStorage.getItem('msgArea-1');
    if (oldMsgArea) {
        localStorage.setItem('msgArea-shen_mian', oldMsgArea);
        localStorage.removeItem('msgArea-1');
    }
    const oldBadge = localStorage.getItem('badge-1');
    if (oldBadge) {
        localStorage.setItem('badge-shen_mian', oldBadge);
        localStorage.removeItem('badge-1');
    }

    // 2. 恢复本地独立聊天窗口 (遍历所有存着的记录找回你的聊天房)
    const activeChats = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('msgArea-')) {
            const roleId = key.replace('msgArea-', '');
            activeChats.push(roleId);
        }
    }
    
    // 动态创建并挂载窗口（现在全部走同一套逻辑了）
    activeChats.forEach(roleId => {
        if (StateManager.getRole(roleId)) {
            AppUI.createChatWindow(roleId);
        } else {
            localStorage.removeItem('msgArea-' + roleId); // 清理残余无主记录
        }
    });

    // 3. 读取聊天历史内容
    activeChats.forEach(roleId => {
        const savedHtml = localStorage.getItem('msgArea-' + roleId);
        if (savedHtml) {
            const area = document.getElementById('msgArea-' + roleId);
            if(area) area.innerHTML = savedHtml;
        }
    });

    AppUI.updateListPreviews(); 
    document.querySelectorAll('.badge-container').forEach(b => { if (localStorage.getItem(b.id) === 'poofed') b.style.display = 'none'; });
    AppUI.initBadgePhysics();

    AppUI.moveIndicator(document.querySelector('.nav-item.active') || AppUI.DOM.navItems()[0], true);
    AppUI.renderReactionGrid();
    
    document.querySelectorAll('input').forEach(inp => inp.addEventListener('blur', () => setTimeout(() => window.scrollTo(0,0), 100)));
    document.querySelectorAll('.chat-messages').forEach(msgArea => msgArea.addEventListener('scroll', () => { if (AppState.getState().activeTargetRow && AppUI.DOM.contextMenu().classList.contains('show')) AppUI.hideAllFloatMenus(); }, {passive: true}));

    // 4. 启动全局手势及交互事件（开启监听大网！）
    AppEvents.init();
  }
};

window.addEventListener('load', () => GlobalApp.init());
/* Local product state. No credentials or payment information are stored here. */
(() => {
  'use strict';

  const STORAGE_KEY = 'xzw-v2';
  const DAY = 24 * 60 * 60 * 1000;
  const HOUR = 60 * 60 * 1000;
  const now = Date.now();
  const ownId = 'me';
  const clone = value => JSON.parse(JSON.stringify(value));
  const cleanText = (value, max = 500) => String(value == null ? '' : value).trim().slice(0, max);
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const unique = array => [...new Set(Array.isArray(array) ? array : [])];
  const validPhoto = value => typeof value === 'string' && /^(assets\/|data:image\/(?:png|jpe?g|webp|gif);base64,|blob:)/i.test(value);

  const sellers = {
    mumu: { id: 'mumu', name: '木木同学', avatar: 'assets/v2/avatar-mumu.jpg', initial: '木', bio: '搬家整理中，认真描述每一件闲置。', city: '杭州', lastActive: '刚刚来过' },
    xiaodao: { id: 'xiaodao', name: '小岛日记', avatar: 'assets/v2/avatar-island.jpg', initial: '岛', bio: '摄影爱好者，希望器材找到继续使用它的人。', city: '上海', lastActive: '10 分钟前来过' },
    aning: { id: 'aning', name: '阿宁', avatar: 'assets/v2/avatar-ning.jpg', initial: '宁', bio: '分享用得上、状态好的日常物品。', city: '杭州', lastActive: '20 分钟前来过' },
    wanfeng: { id: 'wanfeng', name: '晚风', avatar: 'assets/v2/avatar-wind.jpg', initial: '风', bio: '书桌上的小物件，慢慢整理。', city: '杭州', lastActive: '1 小时前来过' },
    manman: { id: 'manman', name: '慢慢生活', avatar: '', initial: '慢', bio: '喜欢阳台与绿植，也喜欢把工具分享给需要的人。', city: '杭州', lastActive: '2 小时前来过' },
    zhoumo: { id: 'zhoumo', name: '周末散步', avatar: '', initial: '周', bio: '把不常穿的鞋，交给更适合的人。', city: '上海', lastActive: '今天来过' }
  };

  const catalog = [
    {
      id: 'chair-01', title: '原木色布艺休闲椅', price: 128, originalPrice: 399,
      category: '家居生活', condition: '九成新', delivery: '同城自提',
      description: '搬家整理转让，灰色布艺坐垫搭配原木色椅脚。平时放在阅读角，椅面有轻微使用痕迹，可先沟通细节。体积较大，仅支持杭州西湖区当面自提，时间可以商量。',
      photos: ['assets/chair.jpg'], sellerId: 'mumu', city: '杭州', district: '西湖区', distance: 1.2,
      age: '2 小时前', wants: 12, createdAt: now - 2 * HOUR, status: '在售'
    },
    {
      id: 'camera-01', title: '佳能单反相机与镜头套装', price: 1680, originalPrice: 4299,
      category: '数码家电', condition: '九成新', delivery: '均可',
      description: '相机与图中镜头一起转让，外观有正常使用痕迹。已不常使用，整理给同样喜欢拍照的人。具体型号、配件和功能细节请先私聊确认，再决定是否购买。支持上海当面验机，也可协商邮寄。',
      photos: ['assets/camera.jpg'], sellerId: 'xiaodao', city: '上海', district: '徐汇区', distance: 165,
      age: '30 分钟前', wants: 28, createdAt: now - HOUR / 2, status: '在售'
    },
    {
      id: 'headphones-01', title: '黑色头戴式耳机', price: 299, originalPrice: 799,
      category: '数码家电', condition: '近全新', delivery: '均可',
      description: '黑色头戴式耳机，外观如图。入手后使用不多，耳罩有轻微使用痕迹。转让前会清洁整理，型号、连接方式及配件情况可私聊确认。杭州可当面检查，邮寄方式另行沟通。',
      photos: ['assets/headphones.jpg'], sellerId: 'aning', city: '杭州', district: '拱墅区', distance: 3.8,
      age: '1 小时前', wants: 8, createdAt: now - HOUR, status: '在售'
    },
    {
      id: 'lamp-01', title: '简约阅读台灯', price: 65, originalPrice: 169,
      category: '家居生活', condition: '九成新', delivery: '快递邮寄',
      description: '书桌换了布局，闲置台灯转让。外观见图片，有正常使用痕迹。灯体尺寸、开关与灯泡情况可先聊清楚；发出前会拍照确认并做好包装。',
      photos: ['assets/lamp.jpg'], sellerId: 'wanfeng', city: '杭州', district: '上城区', distance: 6.4,
      age: '昨天', wants: 5, createdAt: now - DAY, status: '在售'
    },
    {
      id: 'garden-01', title: '阳台园艺工具组合', price: 38, originalPrice: 89,
      category: '家居生活', condition: '有使用痕迹', delivery: '同城自提',
      description: '整理阳台，多出一套种植工具。工具有泥土和正常使用痕迹，可清洁后交付。转让范围以聊天确认的工具清单为准，图片中的植物、花盆和泥土不包含在内。杭州滨江区可自提。',
      photos: ['assets/plant.jpg'], sellerId: 'manman', city: '杭州', district: '滨江区', distance: 8.6,
      age: '3 小时前', wants: 4, createdAt: now - 3 * HOUR, status: '在售'
    },
    {
      id: 'shoes-01', title: '复古配色休闲运动鞋', price: 159, originalPrice: 399,
      category: '服饰鞋包', condition: '九成新', delivery: '快递邮寄',
      description: '复古配色运动鞋，外观如图。鞋面和鞋底有正常穿着痕迹，尺码、内长及细节照片可先联系确认。清洁整理后寄出，建议核对尺寸再下单。',
      photos: ['assets/shoes.jpg'], sellerId: 'zhoumo', city: '上海', district: '静安区', distance: 168,
      age: '昨天', wants: 6, createdAt: now - DAY - HOUR, status: '在售'
    },
    {
      id: 'plant-01', title: '多肉盆栽，含花盆', price: 38, originalPrice: 68,
      category: '家居生活', condition: '状态良好', delivery: '同城自提',
      description: '小株多肉和青绿色花盆一起转让，放在桌面或窗台都很合适。交付前可拍当天状态，花盆有正常使用痕迹。植物不方便邮寄，仅支持杭州当面自提。',
      photos: ['assets/v2/plant-potted.jpg'], sellerId: 'manman', city: '杭州', district: '滨江区', distance: 8.6,
      age: '40 分钟前', wants: 7, createdAt: now - 40 * 60000, status: '在售'
    },
    {
      id: 'books-01', title: '英文商业书籍一组', price: 60, originalPrice: 0,
      category: '图书文具', condition: '有使用痕迹', delivery: '均可',
      description: '整理书架转让一组英文商业与创业书籍。书封、书脊有阅读和存放痕迹。具体书目、数量及内页笔记可先私聊逐本确认，支持杭州自提或协商邮寄。',
      photos: ['assets/v2/books.jpg'], sellerId: 'mumu', city: '杭州', district: '西湖区', distance: 1.2,
      age: '4 小时前', wants: 9, createdAt: now - 4 * HOUR, status: '在售'
    },
    {
      id: 'backpack-01', title: '深蓝色双肩包', price: 89, originalPrice: 199,
      category: '服饰鞋包', condition: '九成新', delivery: '快递邮寄',
      description: '深蓝色双肩包，外观如图。收纳整理后不常使用，包面和肩带有正常使用痕迹。尺寸、内部隔层和拉链情况可先联系确认，发出前会清洁整理。',
      photos: ['assets/v2/backpack.jpg'], sellerId: 'aning', city: '杭州', district: '拱墅区', distance: 3.8,
      age: '昨天', wants: 3, createdAt: now - DAY - 3 * HOUR, status: '在售'
    },
    {
      id: 'keyboard-01', title: '白色薄款键盘', price: 120, originalPrice: 0,
      category: '数码家电', condition: '九成新', delivery: '均可',
      description: '白色薄款键盘，桌面设备更换后闲置。按键和边缘有轻微使用痕迹。具体型号、连接方式、系统适配和附件请私聊确认，购买前可先检查功能。',
      photos: ['assets/v2/keyboard.jpg'], sellerId: 'xiaodao', city: '上海', district: '徐汇区', distance: 165,
      age: '5 小时前', wants: 11, createdAt: now - 5 * HOUR, status: '在售'
    }
  ];

  function defaultDraft() {
    return { title: '', description: '', price: '', category: '', condition: '', delivery: '', photos: [] };
  }

  function defaults() {
    return {
      version: 2,
      favorites: ['chair-01', 'headphones-01'],
      history: [{ id: 'camera-01', at: now - HOUR }, { id: 'chair-01', at: now - DAY }],
      orders: [
        { id: 'WY20261029001', productId: 'chair-01', status: '待自提', delivery: '同城自提', note: '周六下午方便的话联系自提。', addressId: '', amount: 128, createdAt: now - DAY, paidAt: now - DAY + 60000 },
        { id: 'WY20261029002', productId: 'lamp-01', status: '待付款', delivery: '快递邮寄', note: '', addressId: 'address-1', amount: 65, createdAt: now - HOUR },
        { id: 'WY20261025003', productId: 'shoes-01', status: '已完成', delivery: '快递邮寄', note: '', addressId: 'address-1', amount: 159, createdAt: now - 4 * DAY, paidAt: now - 4 * DAY + 60000, completedAt: now - DAY }
      ],
      listings: [],
      conversations: {
        'chair-01': {
          productId: 'chair-01', unread: 1, updatedAt: now - 12 * 60000,
          messages: [
            { role: 'me', text: '你好，休闲椅周末可以自提吗？', time: now - 20 * 60000 },
            { role: 'seller', text: '可以的，我在西湖区。椅面有轻微使用痕迹，取之前可以再发细节给你。', time: now - 12 * 60000 }
          ]
        },
        'camera-01': {
          productId: 'camera-01', unread: 1, updatedAt: now - 35 * 60000,
          messages: [
            { role: 'me', text: '想了解一下相机和镜头的情况，图里的配件都包括吗？', time: now - 40 * 60000 },
            { role: 'seller', text: '你好，相机和镜头一起出。我可以把型号、配件和使用痕迹逐一拍给你确认。', time: now - 35 * 60000 }
          ]
        },
        'headphones-01': {
          productId: 'headphones-01', unread: 0, updatedAt: now - 3 * HOUR,
          messages: [
            { role: 'me', text: '耳机耳罩有没有明显磨损？', time: now - 4 * HOUR },
            { role: 'seller', text: '只有轻微使用痕迹。我整理好细节照片再发给你，确认后再决定就好。', time: now - 3 * HOUR }
          ]
        }
      },
      profile: { name: '林间有风', bio: '认真生活，也让闲置流动起来。', avatar: 'assets/v2/avatar-lin.jpg', city: '杭州' },
      addresses: [{ id: 'address-1', name: '林女士', phone: '13800008000', region: '浙江省 杭州市 西湖区', detail: '文三路 18 号', isDefault: true }],
      draft: defaultDraft(),
      city: '杭州',
      notificationEnabled: true,
      followed: ['manman'],
      likes: [],
      comments: {},
      searchHistory: ['休闲椅', '相机'],
      loggedIn: true
    };
  }

  let stored = null;
  try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (_) {}
  const initial = defaults();
  const state = Object.assign(initial, stored && typeof stored === 'object' ? stored : {});
  state.favorites = unique(state.favorites);
  for (const key of ['history', 'orders', 'listings', 'addresses', 'followed', 'likes', 'searchHistory']) {
    if (!Array.isArray(state[key])) state[key] = defaults()[key];
  }
  state.profile = Object.assign(defaults().profile, state.profile || {});
  state.draft = Object.assign(defaultDraft(), state.draft || {});
  state.draft.photos = Array.isArray(state.draft.photos) ? state.draft.photos.filter(validPhoto).slice(0, 9) : [];
  if (!state.conversations || typeof state.conversations !== 'object') state.conversations = {};
  if (!state.comments || typeof state.comments !== 'object') state.comments = {};

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (_) {
      return false;
    }
  }

  function products() { return state.listings.concat(catalog); }
  function product(id) { return products().find(item => item.id === id) || null; }
  function seller(id) {
    if (id === ownId) {
      return { id: ownId, name: state.profile.name, avatar: state.profile.avatar, initial: state.profile.name.slice(0, 1), bio: state.profile.bio, city: state.city, lastActive: '当前在线' };
    }
    return sellers[id] || null;
  }

  function favorite(id) {
    if (!product(id)) return false;
    const index = state.favorites.indexOf(id);
    if (index < 0) state.favorites.unshift(id);
    else state.favorites.splice(index, 1);
    save();
    return index < 0;
  }
  function isFavorite(id) { return state.favorites.includes(id); }
  function visit(id) {
    if (!product(id)) return;
    state.history = [{ id, at: Date.now() }].concat(state.history.filter(item => item.id !== id)).slice(0, 80);
    save();
  }

  function search(options = {}) {
    const query = cleanText(options.query, 100).toLowerCase();
    const words = query.split(/\s+/).filter(Boolean);
    const category = cleanText(options.category, 30);
    const condition = cleanText(options.condition, 30);
    const delivery = cleanText(options.delivery, 30);
    const status = options.status === undefined ? '在售' : options.status;
    const hasMin = options.min !== undefined && options.min !== null && options.min !== '';
    const hasMax = options.max !== undefined && options.max !== null && options.max !== '';
    let list = products().filter(item => {
      const owner = seller(item.sellerId);
      const text = [item.title, item.category, item.description, owner?.name || ''].join(' ').toLowerCase();
      if (words.length && !words.every(word => text.includes(word))) return false;
      if (category && !['全部', '全部分类', '不限'].includes(category) && item.category !== category) return false;
      if (condition && !['全部', '不限'].includes(condition) && item.condition !== condition) return false;
      if (delivery && !['全部', '不限'].includes(delivery)) {
        const requested = delivery === '支持快递' || delivery === '快递' ? '快递邮寄' : delivery === '当面交易' || delivery === '自提' ? '同城自提' : delivery;
        if (item.delivery !== requested && item.delivery !== '均可') return false;
      }
      if (hasMin && item.price < number(options.min)) return false;
      if (hasMax && item.price > number(options.max, Infinity)) return false;
      if (options.nearby && item.city !== state.city) return false;
      if (status && !['全部', '不限'].includes(status) && item.status !== status) return false;
      return true;
    });
    let sort = options.sort || (options.nearby ? 'distance' : 'recommended');
    if (options.nearby && ['综合', 'recommended'].includes(sort)) sort = 'distance';
    if (['price-asc', 'priceAsc', 'priceAscend', '价格', '价格 ↑', '价格↑', '价格从低到高'].includes(sort)) list.sort((a, b) => a.price - b.price);
    else if (['price-desc', 'priceDesc', '价格 ↓', '价格↓', '价格从高到低'].includes(sort)) list.sort((a, b) => b.price - a.price);
    else if (['newest', 'latest', '最新', '最新发布'].includes(sort)) list.sort((a, b) => b.createdAt - a.createdAt);
    else if (['distance', '附近', '距离最近'].includes(sort)) list.sort((a, b) => a.distance - b.distance);
    else if (['popular', '热门'].includes(sort)) list.sort((a, b) => b.wants - a.wants);
    return list;
  }

  function conversation(productId) {
    const item = product(productId);
    if (!item) return null;
    if (!state.conversations[productId]) {
      state.conversations[productId] = { productId, unread: 0, updatedAt: Date.now(), messages: [] };
      save();
    }
    return state.conversations[productId];
  }
  function send(productId, text) {
    const thread = conversation(productId);
    const content = cleanText(text, 2000);
    if (!thread || !content) return null;
    const message = { role: 'me', text: content, time: Date.now() };
    thread.messages.push(message);
    thread.updatedAt = message.time;
    thread.unread = 0;
    save();
    return message;
  }
  function markRead(productId) {
    const thread = state.conversations[productId];
    if (thread) { thread.unread = 0; save(); }
  }
  function markAllRead() {
    Object.values(state.conversations).forEach(thread => { thread.unread = 0; });
    save();
  }

  function order(id) { return state.orders.find(item => item.id === id) || null; }
  function createOrder(productId, options = {}) {
    const item = product(productId);
    if (!item || item.sellerId === ownId || item.status !== '在售') return null;
    const existing = state.orders.find(record => record.productId === productId && ['待付款', '待自提', '待发货'].includes(record.status));
    if (existing) return existing;
    let delivery = options.delivery || (item.delivery === '均可' ? '快递邮寄' : item.delivery);
    if (!['快递邮寄', '同城自提'].includes(delivery)) return null;
    if (item.delivery !== '均可' && delivery !== item.delivery) return null;
    const record = {
      id: 'WY' + Date.now().toString() + Math.floor(Math.random() * 100).toString().padStart(2, '0'),
      productId,
      status: '待付款',
      delivery,
      note: cleanText(options.note, 200),
      addressId: options.addressId || '',
      amount: item.price,
      createdAt: Date.now()
    };
    state.orders.unshift(record);
    save();
    return record;
  }
  function payOrder(id) {
    const record = order(id);
    if (!record || record.status !== '待付款') return record;
    record.status = record.delivery === '同城自提' ? '待自提' : '待发货';
    record.paidAt = Date.now();
    save();
    return record;
  }
  function completeOrder(id) {
    const record = order(id);
    if (!record || !['待自提', '待收货'].includes(record.status)) return record;
    record.status = '已完成';
    record.completedAt = Date.now();
    save();
    return record;
  }
  function cancelOrder(id) {
    const record = order(id);
    if (!record || record.status !== '待付款') return record;
    record.status = '已取消';
    record.cancelledAt = Date.now();
    save();
    return record;
  }

  function updateDraft(value = {}) {
    Object.assign(state.draft, value);
    if (value.photos) state.draft.photos = value.photos.filter(validPhoto).slice(0, 9);
    save();
    return state.draft;
  }
  function publish(value = state.draft) {
    const title = cleanText(value.title, 30);
    const description = cleanText(value.description, 500);
    const price = Math.round(number(value.price) * 100) / 100;
    const category = cleanText(value.category, 30);
    const condition = cleanText(value.condition, 30);
    const delivery = cleanText(value.delivery, 30);
    const photos = (Array.isArray(value.photos) ? value.photos : []).filter(validPhoto).slice(0, 9);
    if (!title || !description || !category || !condition || !delivery || !photos.length || price <= 0 || price > 999999) throw new Error('请完善照片、标题、描述和物品信息');
    const item = {
      id: 'mine-' + Date.now(), title, price, originalPrice: 0,
      category, condition, delivery, description, photos,
      sellerId: ownId, city: state.city, district: '', distance: 0,
      age: '刚刚', wants: 0, createdAt: Date.now(), status: '在售'
    };
    state.listings.unshift(item);
    state.draft = defaultDraft();
    save();
    return item;
  }
  function updateListing(id, value = {}) {
    const item = state.listings.find(record => record.id === id);
    if (!item) return null;
    for (const key of ['title', 'description', 'category', 'condition', 'delivery']) {
      if (value[key] !== undefined) item[key] = cleanText(value[key], key === 'description' ? 500 : key === 'title' ? 30 : 40);
    }
    if (value.price !== undefined && number(value.price) > 0) item.price = Math.round(number(value.price) * 100) / 100;
    if (Array.isArray(value.photos)) item.photos = value.photos.filter(validPhoto).slice(0, 9);
    if (['在售', '已下架', '已售出'].includes(value.status)) item.status = value.status;
    save();
    return item;
  }
  function removeListing(id) {
    const index = state.listings.findIndex(record => record.id === id);
    if (index < 0) return false;
    state.listings.splice(index, 1);
    state.favorites = state.favorites.filter(value => value !== id);
    state.history = state.history.filter(value => value.id !== id);
    save();
    return true;
  }

  function addAddress(value = {}) {
    const address = {
      id: value.id || 'address-' + Date.now(),
      name: cleanText(value.name, 30), phone: cleanText(value.phone, 20),
      region: cleanText(value.region, 100), detail: cleanText(value.detail, 150),
      isDefault: !!value.isDefault
    };
    if (!address.name || !/^1\d{10}$/.test(address.phone) || !address.region || !address.detail) throw new Error('请填写完整地址和有效手机号');
    if (!state.addresses.length) address.isDefault = true;
    if (address.isDefault) state.addresses.forEach(item => { item.isDefault = false; });
    const index = state.addresses.findIndex(item => item.id === address.id);
    if (index >= 0) state.addresses.splice(index, 1, address);
    else state.addresses.push(address);
    save();
    return address;
  }
  function updateProfile(value = {}) {
    if (value.name !== undefined) {
      const name = cleanText(value.name, 12);
      if (name.length < 2) throw new Error('昵称需为 2–12 个字符');
      state.profile.name = name;
    }
    if (value.bio !== undefined) state.profile.bio = cleanText(value.bio, 100);
    if (value.avatar !== undefined && (!value.avatar || validPhoto(value.avatar))) state.profile.avatar = value.avatar;
    save();
    return state.profile;
  }
  function setCity(name) {
    state.city = cleanText(name, 20) || '杭州';
    save();
    return state.city;
  }
  function follow(id) {
    if (!seller(id) || id === ownId) return false;
    const index = state.followed.indexOf(id);
    if (index >= 0) state.followed.splice(index, 1);
    else state.followed.unshift(id);
    save();
    return index < 0;
  }
  function like(id) {
    const index = state.likes.indexOf(id);
    if (index >= 0) state.likes.splice(index, 1);
    else state.likes.unshift(id);
    save();
    return index < 0;
  }
  function comment(id, text) {
    const content = cleanText(text, 500);
    if (!content) return null;
    const record = { id: 'comment-' + Date.now(), text: content, at: Date.now(), userId: ownId };
    if (!Array.isArray(state.comments[id])) state.comments[id] = [];
    state.comments[id].push(record);
    save();
    return record;
  }
  function rememberSearch(query) {
    const content = cleanText(query, 60);
    if (!content) return;
    state.searchHistory = [content].concat(state.searchHistory.filter(value => value !== content)).slice(0, 12);
    save();
  }

  window.WY = {
    storageKey: STORAGE_KEY,
    catalog,
    sellers,
    state,
    ownId,
    get currentUser() { return seller(ownId); },
    save,
    products, product, seller, search,
    favorite, isFavorite, visit,
    conversation, send, markRead, markAllRead,
    createOrder, order, payOrder, completeOrder, cancelOrder,
    defaultDraft, updateDraft, publish, updateListing, removeListing,
    addAddress, updateProfile, setCity,
    follow, like, comment, rememberSearch,
    reset() {
      const clean = defaults();
      Object.keys(state).forEach(key => { delete state[key]; });
      Object.assign(state, clean);
      save();
    }
  };
})();

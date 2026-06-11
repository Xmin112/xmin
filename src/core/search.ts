import type { POI, RouteTheme } from "./types";

/** 首尔圣水洞种子 POI 数据 —— 每个描述都有场景感 */
export const SEONGSU_SEED_DATA: POI[] = [
  // ── 买衣服 / 古着 ──
  {
    id: "seongsu-001", name: "Ader Error 圣水旗舰店", nameKo: "아더에러 성수 플래그십",
    category: "shop", subcategory: "买衣服",
    lat: 37.5445, lng: 127.0559,
    address: "首尔城东区圣水洞2街 289-14", subwayExit: "4号口", walkingMinutes: 3, popularity: 92,
    description: "韩国最炙手可热的设计师品牌，把整栋楼做成了一件装置艺术。一层的混凝土墙面和螺旋楼梯像走进美术馆——衣服反而藏在楼上。每一季的空间装置都会换，去两次，就是两家店。",
  },
  {
    id: "seongsu-002", name: "Beaker 圣水", nameKo: "비이커 성수",
    category: "shop", subcategory: "买衣服",
    lat: 37.5451, lng: 127.0564,
    address: "首尔城东区圣水洞2街 300-22", subwayExit: "4号口", walkingMinutes: 3, popularity: 85,
    description: "韩系买手店的标杆。从 Low Classic 到 Andersson Bell，韩国设计师品牌在这里被编辑得像一本杂志。陈列不是按品牌，是按「今天想成为什么样的人」来分区——冷淡、柔软、锋利、松弛，你选。",
  },
  {
    id: "seongsu-003", name: "Rockfish Weatherwear 圣水", nameKo: "락피쉬웨더웨어 성수",
    category: "shop", subcategory: "买衣服",
    lat: 37.5448, lng: 127.0568,
    address: "首尔城东区圣水洞2街 300-48", subwayExit: "4号口", walkingMinutes: 5, popularity: 78,
    description: "韩国女生人手一双的雨靴品牌。不只是雨靴——毛衣、风衣、围巾都带着一种「英伦乡下散步」的松弛感。店铺本身像一座小温室，绿植从天花板上垂下来，下雨天来逛感觉反而最好。",
  },
  {
    id: "seongsu-004", name: "Empty 圣水", nameKo: "엠티 성수",
    category: "vintage", subcategory: "买衣服",
    lat: 37.5455, lng: 127.0552,
    address: "首尔城东区圣水洞2街 289-55", subwayExit: "4号口", walkingMinutes: 2, popularity: 88,
    description: "名字叫「空」，但四层楼每一层都在填满你的购物欲。一层是生活方式和香氛，二层是韩系设计师，三层是国际品牌，四层是快闪空间。最妙的是每层楼的灯光和音乐都不一样——像在不同时空穿梭。",
  },
  {
    id: "seongsu-005", name: "Raive 圣水", nameKo: "라이브 성수",
    category: "vintage", subcategory: "买衣服",
    lat: 37.5460, lng: 127.0558,
    address: "首尔城东区圣水洞2街 291-12", subwayExit: "4号口", walkingMinutes: 4, popularity: 72,
    description: "全黑门头，没有任何招牌——知道的人才知道。推开门是另一个世界：Rick Owens 皮衣、Ann Demeulemeester 靴子、独立设计师的解构西装。不是给所有人准备的店，但如果你喜欢暗黑风，这是圣水洞最好的秘密。",
  },
  {
    id: "seongsu-006", name: "低俗小说 Vintage", nameKo: "펄프픽션 빈티지",
    category: "vintage", subcategory: "买衣服",
    lat: 37.5442, lng: 127.0572,
    address: "首尔城东区圣水洞2街 297-33", subwayExit: "4号口", walkingMinutes: 7, popularity: 65,
    description: "开在巷子深处，连导航都要带错路。但推开那扇贴着昆汀海报的门——美式古着衬衫按颜色排列成彩虹，Levi's 牛仔裤叠得像一座山，60 年代的夏威夷衬衫挂在最里面。淘一件独一无二的，是这里最大的乐趣。",
  },
  {
    id: "seongsu-019", name: "Thisisneverthat 圣水", nameKo: "디스이즈네버댓 성수",
    category: "shop", subcategory: "买衣服",
    lat: 37.5452, lng: 127.0556,
    address: "首尔城东区圣水洞2街 292-18", subwayExit: "4号口", walkingMinutes: 3, popularity: 86,
    description: "韩国街头文化的缩影。没有贵的离谱的价格，没有夸张的设计——就是好穿的卫衣、T恤、工装裤。但每一件的面料和版型都经过无数次调整。来这里买基础款，会后悔以前在别处花的钱。",
  },
  {
    id: "seongsu-020", name: "Pandora Jeans", nameKo: "판도라진",
    category: "shop", subcategory: "买衣服",
    lat: 37.5457, lng: 127.0550,
    address: "首尔城东区圣水洞2街 287-9", subwayExit: "3号口", walkingMinutes: 2, popularity: 63,
    description: "一个韩国本土牛仔品牌，不做广告，全靠口碑。版型是专门为亚洲身材调整的——裤长刚好，腰围不勒，大腿处不会紧绷。店铺小小的，但可以试穿所有款式，店员会帮你找到最适合的那条。",
  },

  // ── 咖啡 / 甜品 ──
  {
    id: "seongsu-007", name: "Camel Coffee 圣水", nameKo: "카멜커피 성수",
    category: "cafe", subcategory: "咖啡",
    lat: 37.5449, lng: 127.0560,
    address: "首尔城东区圣水洞2街 300-8", subwayExit: "4号口", walkingMinutes: 3, popularity: 90,
    description: "红砖外墙、裸露的混凝土梁柱、生锈的铁质窗框——这曾经是一间印刷厂。现在的招牌是拿铁和现烤可露丽，外层焦脆内里湿润，配一杯 Ethiopia 手冲刚好。靠窗的位置永远坐满了人，但翻台很快。",
  },
  {
    id: "seongsu-008", name: "Aellista 圣水", nameKo: "아엘리사 성수",
    category: "cafe", subcategory: "咖啡",
    lat: 37.5458, lng: 127.0548,
    address: "首尔城东区圣水洞2街 285-5", subwayExit: "3号口", walkingMinutes: 2, popularity: 75,
    description: "全白空间，从墙壁到杯子到托盘都是白色。提拉米苏是绝对的招牌——手指饼干浸透了浓缩咖啡，马斯卡彭轻盈得几乎像在吃云。只在周末限量供应，下午两点前就卖完了。",
  },
  {
    id: "seongsu-009", name: "Paraspara 圣水", nameKo: "파라스파라 성수",
    category: "cafe", subcategory: "咖啡",
    lat: 37.5453, lng: 127.0566,
    address: "首尔城东区圣水洞2街 299-10", subwayExit: "4号口", walkingMinutes: 5, popularity: 82,
    description: "一座像画廊一样的咖啡馆。墙面定期更换展览——可能是摄影、可能是油画、可能是装置。手冲咖啡是这里的灵魂，每季换一批来自不同产区的单品豆。坐在落地窗前，阳光从旧厂房的铁窗格中打进来，光斑洒在桌上。",
  },
  {
    id: "seongsu-010", name: "Donghae Dakang 圣水", nameKo: "동해다방 성수",
    category: "cafe", subcategory: "咖啡",
    lat: 37.5436, lng: 127.0554,
    address: "首尔城东区圣水洞2街 305-28", subwayExit: "4号口", walkingMinutes: 8, popularity: 68,
    description: "曾经是一间开了 30 年的老茶馆，被年轻老板接手后保留了原来的木结构。红豆冰用铜碗盛着，上面铺着手打糯米团子和烤杏仁片。韩菓是老板的奶奶教的配方，每天现做，下午三点出炉。",
  },
  {
    id: "seongsu-022", name: "Pie Republic 圣水", nameKo: "파이공화국 성수",
    category: "cafe", subcategory: "咖啡",
    lat: 37.5441, lng: 127.0569,
    address: "首尔城东区圣水洞2街 299-33", subwayExit: "4号口", walkingMinutes: 7, popularity: 58,
    description: "「共和国」这个名字是因为这里的派真的可以当饭吃。伯爵茶味派的茶香浓郁到入口像喝了一杯 Earl Grey。苹果肉桂派是冬天限定，热着端上来，肉桂的香气从巷子口就能闻到。",
  },
  {
    id: "seongsu-023", name: "Hodu 圣水", nameKo: "호두 성수",
    category: "cafe", subcategory: "咖啡",
    lat: 37.5454, lng: 127.0546,
    address: "首尔城东区圣水洞2街 284-12", subwayExit: "3号口", walkingMinutes: 1, popularity: 71,
    description: "核桃主题的小咖啡馆。核桃拿铁不是糖浆调的——是真的把核桃磨成酱融进浓缩咖啡里。店里只有六张桌子，墙上挂着老板自己画的核桃插画。安静得像图书馆，可以坐一个下午。",
  },

  // ── 餐厅 / 吃东西 ──
  {
    id: "seongsu-011", name: "圣水阁楼", nameKo: "성수다락",
    category: "restaurant", subcategory: "吃东西",
    lat: 37.5456, lng: 127.0562,
    address: "首尔城东区圣水洞2街 293-8", subwayExit: "4号口", walkingMinutes: 4, popularity: 87,
    description: "旧仓库改的韩牛烤肉店，铁质楼梯嘎吱作响，但上了楼就是另一个世界。韩牛是济州岛直送的，大理石花纹密得像蕾丝。配菜里的泡菜是老板娘自己腌的，发酵了整整三个月。一定得预约，Walk-in 的客人几乎永远等不到位子。",
  },
  {
    id: "seongsu-012", name: "Tsukemen Iroha 圣水", nameKo: "츠케멘 이로하 성수",
    category: "restaurant", subcategory: "吃东西",
    lat: 37.5444, lng: 127.0566,
    address: "首尔城东区圣水洞2街 298-15", subwayExit: "4号口", walkingMinutes: 6, popularity: 70,
    description: "不是拉面，是蘸面。粗面条单独盛在竹篾上，蘸汤是猪骨和鱼介熬了 12 小时的浓缩酱汁，浓到能挂在面上。吃完面之后，店员会往蘸汤里加高汤，变成一碗可以喝的汤——这才是完整的一餐。",
  },
  {
    id: "seongsu-013", name: "圣水洞脊骨汤", nameKo: "성수동감자탕",
    category: "restaurant", subcategory: "吃东西",
    lat: 37.5439, lng: 127.0570,
    address: "首尔城东区圣水洞2街 301-7", subwayExit: "4号口", walkingMinutes: 8, popularity: 60,
    description: "没有任何装修，塑料凳子、铝制桌子、墙上的菜单是手写的。但土豆排骨汤端上来的时候，热气扑面，骨头上的肉轻轻一碰就掉下来。24 小时营业，凌晨三点来吃的人比中午还多。",
  },
  {
    id: "seongsu-014", name: "Mona 圣水", nameKo: "모나 성수",
    category: "restaurant", subcategory: "吃东西",
    lat: 37.5450, lng: 127.0555,
    address: "首尔城东区圣水洞2街 295-22", subwayExit: "4号口", walkingMinutes: 2, popularity: 76,
    description: "新锐主厨的融合料理，午餐三个 Courses 的价格不到三万韩元——在圣水洞几乎是最划算的正餐。菜单每个季节换一次，春天的芦笋烩饭和秋天的栗子浓汤是常客们的最爱。开放式厨房能看到主厨工作的样子，很安静。",
  },
  {
    id: "seongsu-025", name: "圣水 Pasta Bar", nameKo: "성수파스타바",
    category: "restaurant", subcategory: "吃东西",
    lat: 37.5443, lng: 127.0556,
    address: "首尔城东区圣水洞2街 302-6", subwayExit: "4号口", walkingMinutes: 5, popularity: 64,
    description: "小小的店，吧台只有八个座位，所有人围着一座开放厨房。意面是手工现做的，从揉面到切面全在眼前完成。招牌是蛤蜊白葡萄酒意面——蛤蜊的鲜、白葡萄酒的酸、辣椒的微辣，层次分明。",
  },
  {
    id: "seongsu-026", name: "Yang Good", nameKo: "양굿",
    category: "restaurant", subcategory: "吃东西",
    lat: 37.5459, lng: 127.0555,
    address: "首尔城东区圣水洞2街 290-3", subwayExit: "3号口", walkingMinutes: 3, popularity: 77,
    description: "羊肉在韩国不是主流，但这间店让很多从不吃羊肉的韩国人改观。清炖羊肉汤是招牌——汤色奶白，没有膻味，只加了盐和葱花。烤羊排外焦内嫩，孜然的用量刚好，不会抢了肉本身的甜味。",
  },
  {
    id: "seongsu-027", name: "圣水 Dduckbokki", nameKo: "성수떡볶이",
    category: "restaurant", subcategory: "吃东西",
    lat: 37.5438, lng: 127.0549,
    address: "首尔城东区圣水洞2街 307-2", subwayExit: "4号口", walkingMinutes: 8, popularity: 56,
    description: "原本是路边的帐篷摊，因为太受欢迎才有了店面。辣度分五级，韩国本地人最多挑战到第三级——就已经需要狂喝冰水了。炸物拼盘是炒年糕的灵魂搭档：炸鱿鱼、炸紫菜卷、炸饺子，蘸着炒年糕的酱汁吃。",
  },

  // ── 探店 / 文化 ──
  {
    id: "seongsu-015", name: "大林仓库画廊", nameKo: "대림창고 갤러리",
    category: "culture", subcategory: "探店",
    lat: 37.5437, lng: 127.0558,
    address: "首尔城东区圣水洞2街 303-11", subwayExit: "4号口", walkingMinutes: 6, popularity: 83,
    description: "旧米仓改造的当代艺术空间。挑高十几米的屋顶保留了原来的木结构，阳光从天窗倾泻下来。展览以韩国年轻艺术家为主——装置、影像、互动艺术都有。不是那种「站着一动不动看」的展，走进去就是作品的一部分。",
  },
  {
    id: "seongsu-016", name: "圣水洞手工鞋街", nameKo: "성수동 수제화거리",
    category: "shop", subcategory: "探店",
    lat: 37.5446, lng: 127.0545,
    address: "首尔城东区圣水洞2街", subwayExit: "3号口", walkingMinutes: 2, popularity: 74,
    description: "一整条街都是手工鞋作坊，从 1970 年代就存在。每家店门口都摆着鞋楦和皮革样品，老板大多是从父亲那一代接过手艺的。选皮、量脚、定楦、缝制——两周后，一双世界上独一无二的鞋会寄到你家。",
  },
  {
    id: "seongsu-017", name: "Seoul Upcycling Center", nameKo: "서울새활용플라자",
    category: "culture", subcategory: "探店",
    lat: 37.5462, lng: 127.0539,
    address: "首尔城东区圣水洞2街 283-44", subwayExit: "3号口", walkingMinutes: 5, popularity: 55,
    description: "把废弃的汽车安全带做成背包，把旧帆布帐篷做成托特包。这里不只卖东西——你可以参加工坊，自己动手做一件东西出来。两小时的皮具工坊，从裁剪到缝线全程自己来，比买一件成品有意思得多。",
  },
  {
    id: "seongsu-018", name: "圣水艺术空间", nameKo: "성수아트홀",
    category: "culture", subcategory: "探店",
    lat: 37.5453, lng: 127.0570,
    address: "首尔城东区圣水洞2街 296-4", subwayExit: "4号口", walkingMinutes: 6, popularity: 48,
    description: "一个小型的独立艺术空间，展览以实验和声音艺术为主。周末晚上有时会有独立音乐人的小型演出，最多容纳五十个人。没有固定节目表——关注他们的 Instagram 才知道这周末有什么。",
  },
  {
    id: "seongsu-021", name: "Gentle Monster 圣水", nameKo: "젠틀몬스터 성수",
    category: "shop", subcategory: "探店",
    lat: 37.5447, lng: 127.0563,
    address: "首尔城东区圣水洞2街 299-1", subwayExit: "4号口", walkingMinutes: 4, popularity: 95,
    description: "与其说是眼镜店，不如说是一座当代艺术实验场。每三个月更换一次的装置艺术展，上一次是巨大的机械人偶在墙上书写，这一次可能是整层楼变成了稻田。眼镜反而是配角——但你一定会试戴至少三副。从进门到出门，你拍了 20 张照片。",
  },
  {
    id: "seongsu-024", name: "Still Books", nameKo: "스틸북스",
    category: "cafe", subcategory: "探店",
    lat: 37.5456, lng: 127.0568,
    address: "首尔城东区圣水洞2街 294-5", subwayExit: "4号口", walkingMinutes: 5, popularity: 80,
    description: "独立杂志 + 咖啡的复合空间。杂志不是随便摆的——《Magazine B》《Kinfolk》《Apartamento》整排整排地立着，很多是绝版的老期数。点一杯平白咖啡翻一本杂志，一下午过去得不知不觉。",
  },
  {
    id: "seongsu-028", name: "Daelim 创作工坊", nameKo: "대림창작공방",
    category: "culture", subcategory: "探店",
    lat: 37.5461, lng: 127.0542,
    address: "首尔城东区圣水洞2街 282-37", subwayExit: "3号口", walkingMinutes: 4, popularity: 45,
    description: "一个可以自己动手做东西的地方。陶瓷拉坯、皮革缝制、蜡烛浇注——每种工坊两到三小时，老师讲韩语但手势足够让你明白。做出来的东西不完美，但比店里买的多了故事。",
  },
  {
    id: "seongsu-029", name: "城东文化院", nameKo: "성동문화원",
    category: "culture", subcategory: "探店",
    lat: 37.5440, lng: 127.0543,
    address: "首尔城东区圣水洞1街 656-22", subwayExit: "3号口", walkingMinutes: 5, popularity: 40,
    description: "很少有游客知道的韩服体验点。和景福宫那些排队的韩服店不同，这里的韩服是真正的手工缝制，颜色素雅不花哨。茶道体验只有四十分钟，但那种安静的仪式感，会一直记得。",
  },
  {
    id: "seongsu-030", name: "Point of View 圣水", nameKo: "포인트오브뷰 성수",
    category: "shop", subcategory: "探店",
    lat: 37.5450, lng: 127.0567,
    address: "首尔城东区圣水洞2街 298-20", subwayExit: "4号口", walkingMinutes: 5, popularity: 89,
    description: "韩国最好的文具选品店之一。三层楼，从钢笔、笔记本到桌面收纳都有。最迷人的是一整面墙的韩国设计师贺卡——每张都像一幅小画。文具控进来至少要待一小时，每个抽屉都想拉开看一看。",
  },
];

/** 按主题过滤 + 按热度排序 */
export function filterPoisByTheme(theme: RouteTheme, pois?: POI[]): POI[] {
  const source = pois ?? SEONGSU_SEED_DATA;
  return source
    .filter((p) => {
      switch (theme) {
        case "买衣服":
          return p.subcategory === "买衣服";
        case "吃东西":
          return p.subcategory === "吃东西";
        case "咖啡":
          return p.subcategory === "咖啡";
        case "探店":
          return p.subcategory === "探店" || p.category === "culture";
        case "文化":
          return p.category === "culture";
        case "综合":
        default:
          return true;
      }
    })
    .sort((a, b) => b.popularity - a.popularity);
}

/** 按名称查找 POI */
export function findPoiByName(name: string, pois?: POI[]): POI | undefined {
  const source = pois ?? SEONGSU_SEED_DATA;
  return source.find(
    (p) =>
      p.name === name ||
      p.nameKo === name ||
      p.name.includes(name) ||
      (p.nameKo && p.nameKo.includes(name)),
  );
}

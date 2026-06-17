from flask import Flask, jsonify, render_template

app = Flask(__name__)

QUESTIONS = {
    "position": [
        {
            "question": "小明面向北方站着，他的右边是哪个方向？",
            "options": ["东方", "西方", "南方", "北方"],
            "answer": "东方",
            "explanation": "面向北方时，右边是东方，左边是西方，背后是南方。",
        },
        {
            "question": "小红面向东方，她向左转90度后面向哪个方向？",
            "options": ["北方", "南方", "西方", "东方"],
            "answer": "北方",
            "explanation": "面向东方向左转90度，就是转向北方。",
        },
        {
            "question": "在地图上，通常上方表示哪个方向？",
            "options": ["北方", "南方", "东方", "西方"],
            "answer": "北方",
            "explanation": "地图惯例是“上北下南，左西右东”，所以上方是北方。",
        },
        {
            "question": "学校在小明家的东面，小明从学校回家应该往哪个方向走？",
            "options": ["东", "西", "南", "北"],
            "answer": "西",
            "explanation": "学校在家的东面，回家就要往相反方向，也就是西面走。",
        },
        {
            "question": "太阳从哪个方向升起？",
            "options": ["东方", "西方", "南方", "北方"],
            "answer": "东方",
            "explanation": "太阳每天从东方升起，从西方落下。",
        },
        {
            "question": "面向南方站着，向左转90度后面向哪个方向？",
            "options": ["东", "西", "南", "北"],
            "answer": "东",
            "explanation": "面向南方时，左边是东方，向左转90度就面向东方。",
        },
        {
            "question": "图书馆在公园的北面，从图书馆去公园应该往哪个方向走？",
            "options": ["北", "南", "东", "西"],
            "answer": "南",
            "explanation": "图书馆在公园北面，去公园就要往南走。",
        },
        {
            "question": "“上北下南，左西右东”中，右面是哪个方向？",
            "options": ["东", "西", "南", "北"],
            "answer": "东",
            "explanation": "口诀“上北下南，左西右东”告诉我们，右面是东方。",
        },
        {
            "question": "小华面向西方，向右转90度后面向哪个方向？",
            "options": ["北", "南", "东", "西"],
            "answer": "北",
            "explanation": "面向西方时，右边是北方，向右转90度就面向北方。",
        },
        {
            "question": "在方格纸上，从(2,3)向右走2格，再向上走1格，到达(4,4)。这个说法对吗？",
            "options": ["对", "错", "无法判断", "向右走1格"],
            "answer": "对",
            "explanation": "向右走2格：列从2变4；向上走1格：行从3变4，所以到达(4,4)，说法正确。",
        },
    ],
    "division": [
        {
            "question": "48 ÷ 6 = ？",
            "options": ["6", "7", "8", "9"],
            "answer": "8",
            "explanation": "因为 6 × 8 = 48，所以 48 ÷ 6 = 8。",
        },
        {
            "question": "63 ÷ 7 = ？",
            "options": ["7", "8", "9", "10"],
            "answer": "9",
            "explanation": "因为 7 × 9 = 63，所以 63 ÷ 7 = 9。",
        },
        {
            "question": "56 ÷ 8 = ？",
            "options": ["6", "7", "8", "9"],
            "answer": "7",
            "explanation": "因为 8 × 7 = 56，所以 56 ÷ 8 = 7。",
        },
        {
            "question": "72 ÷ 9 = ？",
            "options": ["6", "7", "8", "9"],
            "answer": "8",
            "explanation": "因为 9 × 8 = 72，所以 72 ÷ 9 = 8。",
        },
        {
            "question": "45 ÷ 5 = ？",
            "options": ["7", "8", "9", "10"],
            "answer": "9",
            "explanation": "因为 5 × 9 = 45，所以 45 ÷ 5 = 9。",
        },
        {
            "question": "有36个苹果，平均分给4个小朋友，每人分到几个？",
            "options": ["8个", "9个", "10个", "12个"],
            "answer": "9个",
            "explanation": "36 ÷ 4 = 9，所以每人分到9个苹果。",
        },
        {
            "question": "84 ÷ 7 = ？",
            "options": ["10", "11", "12", "13"],
            "answer": "12",
            "explanation": "因为 7 × 12 = 84，所以 84 ÷ 7 = 12。",
        },
        {
            "question": "54 ÷ 6 = ？",
            "options": ["8", "9", "10", "11"],
            "answer": "9",
            "explanation": "因为 6 × 9 = 54，所以 54 ÷ 6 = 9。",
        },
        {
            "question": "96 ÷ 8 = ？",
            "options": ["10", "11", "12", "13"],
            "answer": "12",
            "explanation": "因为 8 × 12 = 96，所以 96 ÷ 8 = 12。",
        },
        {
            "question": "老师把42本练习册平均分给7个小组，每组分到几本？",
            "options": ["5本", "6本", "7本", "8本"],
            "answer": "6本",
            "explanation": "42 ÷ 7 = 6，所以每组分到6本练习册。",
        },
    ],
}

CATEGORY_NAMES = {
    "position": "位置与方向",
    "division": "除法",
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/categories")
def categories():
    return jsonify(
        [
            {"id": key, "name": name, "count": len(QUESTIONS[key])}
            for key, name in CATEGORY_NAMES.items()
        ]
    )


@app.route("/api/questions/<category>")
def get_questions(category):
    if category not in QUESTIONS:
        return jsonify({"error": "未找到该知识点"}), 404
    return jsonify(QUESTIONS[category])


if __name__ == "__main__":
    app.run(debug=True, port=5000)

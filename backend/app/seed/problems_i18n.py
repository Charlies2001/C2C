"""
Multilingual translations for seed problems.
Keyed by slug, then language code.
Only contains fields that need translation: title, description, category, starter_code.
"""

TRANSLATIONS: dict[str, dict[str, dict[str, str]]] = {
    # =========================================================================
    # 1. Two Sum (两数之和)
    # =========================================================================
    "two-sum": {
        "en-US": {
            "title": "Two Sum",
            "category": "Array",
            "description": """## Two Sum

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

### Examples

```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1]
```

```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

### Constraints
- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- Only one valid answer exists""",
            "starter_code": "def two_sum(nums, target):\n    # Write your code here\n    pass\n",
        },
        "ja-JP": {
            "title": "二数の和",
            "category": "配列",
            "description": """## 二数の和

整数配列 `nums` と整数 `target` が与えられたとき、合計が `target` になる2つの整数を見つけ、それらの配列インデックスを返してください。

各入力にはちょうど1つの解があると仮定でき、同じ要素を2回使用することはできません。

回答は任意の順序で返すことができます。

### 例

```
入力：nums = [2,7,11,15], target = 9
出力：[0,1]
説明：nums[0] + nums[1] == 9 なので、[0, 1] を返す
```

```
入力：nums = [3,2,4], target = 6
出力：[1,2]
```

### 制約
- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- 有効な答えは1つだけ存在する""",
            "starter_code": "def two_sum(nums, target):\n    # ここにコードを書く\n    pass\n",
        },
        "ko-KR": {
            "title": "두 수의 합",
            "category": "배열",
            "description": """## 두 수의 합

정수 배열 `nums`와 정수 목표값 `target`이 주어졌을 때, 합이 `target`이 되는 두 정수를 찾아 그 배열 인덱스를 반환하세요.

각 입력에는 정확히 하나의 답이 있다고 가정하며, 같은 요소를 두 번 사용할 수 없습니다.

답은 어떤 순서로든 반환할 수 있습니다.

### 예시

```
입력: nums = [2,7,11,15], target = 9
출력: [0,1]
설명: nums[0] + nums[1] == 9 이므로 [0, 1]을 반환합니다
```

```
입력: nums = [3,2,4], target = 6
출력: [1,2]
```

### 제약 조건
- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- 유효한 답은 하나만 존재합니다""",
            "starter_code": "def two_sum(nums, target):\n    # 여기에 코드를 작성하세요\n    pass\n",
        },
    },
    # =========================================================================
    # 2. Best Time to Buy and Sell Stock (买卖股票的最佳时机)
    # =========================================================================
    "best-time-to-buy-and-sell-stock": {
        "en-US": {
            "title": "Best Time to Buy and Sell Stock",
            "category": "Array",
            "description": """## Best Time to Buy and Sell Stock

You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Design an algorithm to find the maximum profit.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.

### Examples

```
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5
```

```
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transaction is completed, so the maximum profit is 0
```""",
            "starter_code": "def max_profit(prices):\n    # Write your code here\n    pass\n",
        },
        "ja-JP": {
            "title": "株の売買の最適なタイミング",
            "category": "配列",
            "description": """## 株の売買の最適なタイミング

配列 `prices` が与えられ、`prices[i]` は指定された株式の `i` 日目の価格を表します。

ある1日を選んで株を購入し、将来の別の日を選んで売却することで利益を最大化したいです。最大利益を計算するアルゴリズムを設計してください。

この取引から得られる最大利益を返してください。利益が得られない場合は `0` を返してください。

### 例

```
入力：prices = [7,1,5,3,6,4]
出力：5
説明：2日目（価格 = 1）に購入し、5日目（価格 = 6）に売却、利益 = 6 - 1 = 5
```

```
入力：prices = [7,6,4,3,1]
出力：0
説明：この場合、取引は行われないため、最大利益は 0
```""",
            "starter_code": "def max_profit(prices):\n    # ここにコードを書く\n    pass\n",
        },
        "ko-KR": {
            "title": "주식을 사고팔기 가장 좋은 시점",
            "category": "배열",
            "description": """## 주식을 사고팔기 가장 좋은 시점

배열 `prices`가 주어지며, `prices[i]`는 주어진 주식의 `i`번째 날 가격을 나타냅니다.

하루를 선택하여 주식을 매수하고, 미래의 다른 날을 선택하여 해당 주식을 매도하여 이익을 최대화하려고 합니다. 최대 이익을 계산하는 알고리즘을 설계하세요.

이 거래에서 얻을 수 있는 최대 이익을 반환하세요. 이익을 얻을 수 없는 경우 `0`을 반환하세요.

### 예시

```
입력: prices = [7,1,5,3,6,4]
출력: 5
설명: 2일째(가격 = 1)에 매수하고 5일째(가격 = 6)에 매도하면, 이익 = 6 - 1 = 5
```

```
입력: prices = [7,6,4,3,1]
출력: 0
설명: 이 경우 거래가 완료되지 않으므로 최대 이익은 0입니다
```""",
            "starter_code": "def max_profit(prices):\n    # 여기에 코드를 작성하세요\n    pass\n",
        },
    },
    # =========================================================================
    # 3. Valid Palindrome (有效回文串)
    # =========================================================================
    "valid-palindrome": {
        "en-US": {
            "title": "Valid Palindrome",
            "category": "String",
            "description": """## Valid Palindrome

A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Alphanumeric characters include letters and numbers.

Given a string `s`, return `True` if it is a palindrome, or `False` otherwise.

### Examples

```
Input: s = "A man, a plan, a canal: Panama"
Output: True
Explanation: "amanaplanacanalpanama" is a palindrome
```

```
Input: s = "race a car"
Output: False
```""",
            "starter_code": "def is_palindrome(s):\n    # Write your code here\n    pass\n",
        },
        "ja-JP": {
            "title": "有効な回文",
            "category": "文字列",
            "description": """## 有効な回文

すべての大文字を小文字に変換し、英数字以外のすべての文字を削除した後、前から読んでも後ろから読んでも同じであれば、そのフレーズは回文と見なすことができます。

英字と数字は英数字に含まれます。

文字列 `s` が与えられたとき、回文であれば `True` を、そうでなければ `False` を返してください。

### 例

```
入力：s = "A man, a plan, a canal: Panama"
出力：True
説明："amanaplanacanalpanama" は回文である
```

```
入力：s = "race a car"
出力：False
```""",
            "starter_code": "def is_palindrome(s):\n    # ここにコードを書く\n    pass\n",
        },
        "ko-KR": {
            "title": "유효한 회문",
            "category": "문자열",
            "description": """## 유효한 회문

모든 대문자를 소문자로 변환하고, 영숫자가 아닌 모든 문자를 제거한 후, 앞에서 읽으나 뒤에서 읽으나 같으면 해당 구문은 회문이라고 할 수 있습니다.

문자와 숫자는 영숫자에 포함됩니다.

문자열 `s`가 주어졌을 때, 회문이면 `True`를, 그렇지 않으면 `False`를 반환하세요.

### 예시

```
입력: s = "A man, a plan, a canal: Panama"
출력: True
설명: "amanaplanacanalpanama"는 회문입니다
```

```
입력: s = "race a car"
출력: False
```""",
            "starter_code": "def is_palindrome(s):\n    # 여기에 코드를 작성하세요\n    pass\n",
        },
    },
    # =========================================================================
    # 4. Longest Substring Without Repeating Characters (无重复字符的最长子串)
    # =========================================================================
    "longest-substring-without-repeating": {
        "en-US": {
            "title": "Longest Substring Without Repeating Characters",
            "category": "String",
            "description": """## Longest Substring Without Repeating Characters

Given a string `s`, find the length of the longest substring without repeating characters.

### Examples

```
Input: s = "abcabcbb"
Output: 3
Explanation: The longest substring without repeating characters is "abc", so its length is 3
```

```
Input: s = "bbbbb"
Output: 1
Explanation: The longest substring without repeating characters is "b", so its length is 1
```

```
Input: s = "pwwkew"
Output: 3
Explanation: The longest substring without repeating characters is "wke", so its length is 3
```""",
            "starter_code": "def length_of_longest_substring(s):\n    # Write your code here\n    pass\n",
        },
        "ja-JP": {
            "title": "重複文字のない最長部分文字列",
            "category": "文字列",
            "description": """## 重複文字のない最長部分文字列

文字列 `s` が与えられたとき、重複する文字を含まない最長の部分文字列の長さを求めてください。

### 例

```
入力：s = "abcabcbb"
出力：3
説明：重複文字のない最長の部分文字列は "abc" であり、その長さは 3
```

```
入力：s = "bbbbb"
出力：1
説明：重複文字のない最長の部分文字列は "b" であり、その長さは 1
```

```
入力：s = "pwwkew"
出力：3
説明：重複文字のない最長の部分文字列は "wke" であり、その長さは 3
```""",
            "starter_code": "def length_of_longest_substring(s):\n    # ここにコードを書く\n    pass\n",
        },
        "ko-KR": {
            "title": "중복 문자 없는 가장 긴 부분 문자열",
            "category": "문자열",
            "description": """## 중복 문자 없는 가장 긴 부분 문자열

문자열 `s`가 주어졌을 때, 중복되는 문자가 없는 가장 긴 부분 문자열의 길이를 구하세요.

### 예시

```
입력: s = "abcabcbb"
출력: 3
설명: 중복 문자가 없는 가장 긴 부분 문자열은 "abc"이므로 그 길이는 3입니다
```

```
입력: s = "bbbbb"
출력: 1
설명: 중복 문자가 없는 가장 긴 부분 문자열은 "b"이므로 그 길이는 1입니다
```

```
입력: s = "pwwkew"
출력: 3
설명: 중복 문자가 없는 가장 긴 부분 문자열은 "wke"이므로 그 길이는 3입니다
```""",
            "starter_code": "def length_of_longest_substring(s):\n    # 여기에 코드를 작성하세요\n    pass\n",
        },
    },
    # =========================================================================
    # 5. Reverse Linked List (反转链表)
    # =========================================================================
    "reverse-linked-list": {
        "en-US": {
            "title": "Reverse Linked List",
            "category": "Linked List",
            "description": """## Reverse Linked List

Given the `head` of a singly linked list, reverse the list, and return the reversed list.

Linked list node definition:
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

### Examples

```
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
```

```
Input: head = [1,2]
Output: [2,1]
```

```
Input: head = []
Output: []
```""",
            "starter_code": "def reverse_list(head):\n    # Write your code here\n    pass\n",
        },
        "ja-JP": {
            "title": "連結リストの反転",
            "category": "連結リスト",
            "description": """## 連結リストの反転

単方向連結リストの先頭ノード `head` が与えられたとき、連結リストを反転し、反転後の連結リストを返してください。

連結リストノードの定義：
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

### 例

```
入力：head = [1,2,3,4,5]
出力：[5,4,3,2,1]
```

```
入力：head = [1,2]
出力：[2,1]
```

```
入力：head = []
出力：[]
```""",
            "starter_code": "def reverse_list(head):\n    # ここにコードを書く\n    pass\n",
        },
        "ko-KR": {
            "title": "연결 리스트 뒤집기",
            "category": "연결 리스트",
            "description": """## 연결 리스트 뒤집기

단일 연결 리스트의 헤드 노드 `head`가 주어졌을 때, 연결 리스트를 뒤집고, 뒤집힌 연결 리스트를 반환하세요.

연결 리스트 노드 정의:
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

### 예시

```
입력: head = [1,2,3,4,5]
출력: [5,4,3,2,1]
```

```
입력: head = [1,2]
출력: [2,1]
```

```
입력: head = []
출력: []
```""",
            "starter_code": "def reverse_list(head):\n    # 여기에 코드를 작성하세요\n    pass\n",
        },
    },
    # =========================================================================
    # 6. Merge Two Sorted Lists (合并两个有序链表)
    # =========================================================================
    "merge-two-sorted-lists": {
        "en-US": {
            "title": "Merge Two Sorted Lists",
            "category": "Linked List",
            "description": """## Merge Two Sorted Lists

Merge two sorted linked lists and return it as a new sorted list. The new list should be made by splicing together the nodes of the two given lists.

### Examples

```
Input: l1 = [1,2,4], l2 = [1,3,4]
Output: [1,1,2,3,4,4]
```

```
Input: l1 = [], l2 = []
Output: []
```

```
Input: l1 = [], l2 = [0]
Output: [0]
```""",
            "starter_code": "def merge_two_lists(l1, l2):\n    # Write your code here\n    pass\n",
        },
        "ja-JP": {
            "title": "2つのソート済みリストのマージ",
            "category": "連結リスト",
            "description": """## 2つのソート済みリストのマージ

2つの昇順ソート済み連結リストを1つの新しい昇順ソート済みリストにマージして返してください。新しいリストは、与えられた2つのリストの全ノードを繋ぎ合わせて構成します。

### 例

```
入力：l1 = [1,2,4], l2 = [1,3,4]
出力：[1,1,2,3,4,4]
```

```
入力：l1 = [], l2 = []
出力：[]
```

```
入力：l1 = [], l2 = [0]
出力：[0]
```""",
            "starter_code": "def merge_two_lists(l1, l2):\n    # ここにコードを書く\n    pass\n",
        },
        "ko-KR": {
            "title": "두 정렬 리스트 병합",
            "category": "연결 리스트",
            "description": """## 두 정렬 리스트 병합

두 개의 오름차순 정렬된 연결 리스트를 하나의 새로운 오름차순 정렬된 리스트로 병합하여 반환하세요. 새 리스트는 주어진 두 리스트의 모든 노드를 이어 붙여 구성합니다.

### 예시

```
입력: l1 = [1,2,4], l2 = [1,3,4]
출력: [1,1,2,3,4,4]
```

```
입력: l1 = [], l2 = []
출력: []
```

```
입력: l1 = [], l2 = [0]
출력: [0]
```""",
            "starter_code": "def merge_two_lists(l1, l2):\n    # 여기에 코드를 작성하세요\n    pass\n",
        },
    },
    # =========================================================================
    # 7. Maximum Depth of Binary Tree (二叉树的最大深度)
    # =========================================================================
    "maximum-depth-of-binary-tree": {
        "en-US": {
            "title": "Maximum Depth of Binary Tree",
            "category": "Tree",
            "description": """## Maximum Depth of Binary Tree

Given a binary tree `root`, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

### Examples

```
Input: root = [3,9,20,null,null,15,7]
Output: 3
```

```
Input: root = [1,null,2]
Output: 2
```""",
            "starter_code": "def max_depth(root):\n    # Write your code here\n    pass\n",
        },
        "ja-JP": {
            "title": "二分木の最大深さ",
            "category": "木",
            "description": """## 二分木の最大深さ

二分木 `root` が与えられたとき、その最大深さを返してください。

二分木の最大深さとは、ルートノードから最も遠い葉ノードまでの最長パス上のノード数です。

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

### 例

```
入力：root = [3,9,20,null,null,15,7]
出力：3
```

```
入力：root = [1,null,2]
出力：2
```""",
            "starter_code": "def max_depth(root):\n    # ここにコードを書く\n    pass\n",
        },
        "ko-KR": {
            "title": "이진 트리의 최대 깊이",
            "category": "트리",
            "description": """## 이진 트리의 최대 깊이

이진 트리 `root`가 주어졌을 때, 최대 깊이를 반환하세요.

이진 트리의 최대 깊이란 루트 노드에서 가장 먼 리프 노드까지의 최장 경로에 있는 노드 수입니다.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

### 예시

```
입력: root = [3,9,20,null,null,15,7]
출력: 3
```

```
입력: root = [1,null,2]
출력: 2
```""",
            "starter_code": "def max_depth(root):\n    # 여기에 코드를 작성하세요\n    pass\n",
        },
    },
    # =========================================================================
    # 8. Invert Binary Tree (翻转二叉树)
    # =========================================================================
    "invert-binary-tree": {
        "en-US": {
            "title": "Invert Binary Tree",
            "category": "Tree",
            "description": """## Invert Binary Tree

Given the root of a binary tree `root`, invert the tree, and return its root.

### Examples

```
Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]
```

```
Input: root = [2,1,3]
Output: [2,3,1]
```""",
            "starter_code": "def invert_tree(root):\n    # Write your code here\n    pass\n",
        },
        "ja-JP": {
            "title": "二分木の反転",
            "category": "木",
            "description": """## 二分木の反転

二分木のルートノード `root` が与えられたとき、この二分木を反転し、そのルートノードを返してください。

### 例

```
入力：root = [4,2,7,1,3,6,9]
出力：[4,7,2,9,6,3,1]
```

```
入力：root = [2,1,3]
出力：[2,3,1]
```""",
            "starter_code": "def invert_tree(root):\n    # ここにコードを書く\n    pass\n",
        },
        "ko-KR": {
            "title": "이진 트리 뒤집기",
            "category": "트리",
            "description": """## 이진 트리 뒤집기

이진 트리의 루트 노드 `root`가 주어졌을 때, 이 이진 트리를 뒤집고, 루트 노드를 반환하세요.

### 예시

```
입력: root = [4,2,7,1,3,6,9]
출력: [4,7,2,9,6,3,1]
```

```
입력: root = [2,1,3]
출력: [2,3,1]
```""",
            "starter_code": "def invert_tree(root):\n    # 여기에 코드를 작성하세요\n    pass\n",
        },
    },
    # =========================================================================
    # 9. Climbing Stairs (爬楼梯)
    # =========================================================================
    "climbing-stairs": {
        "en-US": {
            "title": "Climbing Stairs",
            "category": "Dynamic Programming",
            "description": """## Climbing Stairs

You are climbing a staircase. It takes `n` steps to reach the top.

Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?

### Examples

```
Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps
```

```
Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step
```""",
            "starter_code": "def climb_stairs(n):\n    # Write your code here\n    pass\n",
        },
        "ja-JP": {
            "title": "階段の上り方",
            "category": "動的計画法",
            "description": """## 階段の上り方

あなたは階段を上っています。頂上に到達するには `n` 段を上る必要があります。

毎回 `1` 段または `2` 段を上ることができます。頂上まで何通りの異なる方法で上ることができますか？

### 例

```
入力：n = 2
出力：2
説明：頂上まで上る方法は2通りあります。
1. 1段 + 1段
2. 2段
```

```
入力：n = 3
出力：3
説明：頂上まで上る方法は3通りあります。
1. 1段 + 1段 + 1段
2. 1段 + 2段
3. 2段 + 1段
```""",
            "starter_code": "def climb_stairs(n):\n    # ここにコードを書く\n    pass\n",
        },
        "ko-KR": {
            "title": "계단 오르기",
            "category": "동적 프로그래밍",
            "description": """## 계단 오르기

당신은 계단을 오르고 있습니다. 꼭대기에 도달하려면 `n`계단을 올라야 합니다.

매번 `1`계단 또는 `2`계단을 오를 수 있습니다. 꼭대기까지 오르는 서로 다른 방법은 몇 가지입니까?

### 예시

```
입력: n = 2
출력: 2
설명: 꼭대기까지 오르는 방법은 두 가지입니다.
1. 1계단 + 1계단
2. 2계단
```

```
입력: n = 3
출력: 3
설명: 꼭대기까지 오르는 방법은 세 가지입니다.
1. 1계단 + 1계단 + 1계단
2. 1계단 + 2계단
3. 2계단 + 1계단
```""",
            "starter_code": "def climb_stairs(n):\n    # 여기에 코드를 작성하세요\n    pass\n",
        },
    },
    # =========================================================================
    # 10. Coin Change (零钱兑换)
    # =========================================================================
    "coin-change": {
        "en-US": {
            "title": "Coin Change",
            "category": "Dynamic Programming",
            "description": """## Coin Change

You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.

You may assume that you have an infinite number of each kind of coin.

### Examples

```
Input: coins = [1, 5, 11], amount = 11
Output: 1
Explanation: 11 = 11
```

```
Input: coins = [2], amount = 3
Output: -1
```

```
Input: coins = [1], amount = 0
Output: 0
```""",
            "starter_code": "def coin_change(coins, amount):\n    # Write your code here\n    pass\n",
        },
        "ja-JP": {
            "title": "コイン両替",
            "category": "動的計画法",
            "description": """## コイン両替

異なる額面のコインを表す整数配列 `coins` と、合計金額を表す整数 `amount` が与えられます。

合計金額を作るのに必要な最小のコイン枚数を計算して返してください。どのコインの組み合わせでも合計金額を作れない場合は `-1` を返してください。

各種類のコインは無限に使えるものとします。

### 例

```
入力：coins = [1, 5, 11], amount = 11
出力：1
説明：11 = 11
```

```
入力：coins = [2], amount = 3
出力：-1
```

```
入力：coins = [1], amount = 0
出力：0
```""",
            "starter_code": "def coin_change(coins, amount):\n    # ここにコードを書く\n    pass\n",
        },
        "ko-KR": {
            "title": "거스름돈",
            "category": "동적 프로그래밍",
            "description": """## 거스름돈

서로 다른 액면가의 동전을 나타내는 정수 배열 `coins`와 총 금액을 나타내는 정수 `amount`가 주어집니다.

해당 금액을 만드는 데 필요한 최소 동전 개수를 계산하여 반환하세요. 어떤 동전 조합으로도 해당 금액을 만들 수 없으면 `-1`을 반환하세요.

각 종류의 동전은 무한히 사용할 수 있다고 가정합니다.

### 예시

```
입력: coins = [1, 5, 11], amount = 11
출력: 1
설명: 11 = 11
```

```
입력: coins = [2], amount = 3
출력: -1
```

```
입력: coins = [1], amount = 0
출력: 0
```""",
            "starter_code": "def coin_change(coins, amount):\n    # 여기에 코드를 작성하세요\n    pass\n",
        },
    },
}

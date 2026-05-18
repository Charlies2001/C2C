SEED_PROBLEMS = [
    {
        "title": "两数之和",
        "slug": "two-sum",
        "difficulty": "Easy",
        "category": "数组",
        "description": """## 两数之和

给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出和为目标值 `target` 的那两个整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

你可以按任意顺序返回答案。

### 示例

```
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9，返回 [0, 1]
```

```
输入：nums = [3,2,4], target = 6
输出：[1,2]
```

### 提示
- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- 只会存在一个有效答案""",
        "starter_code": "def two_sum(nums, target):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            # 基础用例
            {"input": "nums = [2,7,11,15]\ntarget = 9\nprint(two_sum(nums, target))", "expected": "[0, 1]"},
            {"input": "nums = [3,2,4]\ntarget = 6\nprint(two_sum(nums, target))", "expected": "[1, 2]"},
            {"input": "nums = [3,3]\ntarget = 6\nprint(two_sum(nums, target))", "expected": "[0, 1]"},
            # 常规用例
            {"input": "nums = [1,2,3,4,5]\ntarget = 9\nprint(two_sum(nums, target))", "expected": "[3, 4]"},
            {"input": "nums = [4,5,6,7,8,9]\ntarget = 13\nprint(two_sum(nums, target))", "expected": "[1, 4]"},
            {"input": "nums = [10,20,30,40,50]\ntarget = 70\nprint(two_sum(nums, target))", "expected": "[2, 4]"},
            {"input": "nums = [1,3,5,7,9,11]\ntarget = 12\nprint(two_sum(nums, target))", "expected": "[0, 5]"},
            {"input": "nums = [100,200,300,400]\ntarget = 500\nprint(two_sum(nums, target))", "expected": "[1, 2]"},
            # 边界用例 - 两元素数组
            {"input": "nums = [1,2]\ntarget = 3\nprint(two_sum(nums, target))", "expected": "[0, 1]"},
            {"input": "nums = [0,0]\ntarget = 0\nprint(two_sum(nums, target))", "expected": "[0, 1]"},
            # 负数
            {"input": "nums = [-1,-2,-3,-4,-5]\ntarget = -8\nprint(two_sum(nums, target))", "expected": "[2, 4]"},
            {"input": "nums = [-3,4,3,90]\ntarget = 0\nprint(two_sum(nums, target))", "expected": "[0, 2]"},
            {"input": "nums = [-10,20,-30,40]\ntarget = 10\nprint(two_sum(nums, target))", "expected": "[0, 1]"},
            # target 为 0
            {"input": "nums = [5,-5,10,20]\ntarget = 0\nprint(two_sum(nums, target))", "expected": "[0, 1]"},
            # 大数值
            {"input": "nums = [1000000000, -1000000000, 3, 7]\ntarget = 0\nprint(two_sum(nums, target))", "expected": "[0, 1]"},
            {"input": "nums = [999999999, 1, 2, 3]\ntarget = 1000000000\nprint(two_sum(nums, target))", "expected": "[0, 1]"},
            # 重复元素（答案不涉及重复）
            {"input": "nums = [1,5,5,11]\ntarget = 16\nprint(two_sum(nums, target))", "expected": "[2, 3]"},
            # 答案在数组末尾
            {"input": "nums = [1,2,3,4,5,6,7,8]\ntarget = 15\nprint(two_sum(nums, target))", "expected": "[6, 7]"},
            # 答案在数组首尾
            {"input": "nums = [2,5,8,11]\ntarget = 13\nprint(two_sum(nums, target))", "expected": "[0, 3]"},
            # 连续数
            {"input": "nums = [1,2,3,4,5,6,7,8,9,10]\ntarget = 19\nprint(two_sum(nums, target))", "expected": "[8, 9]"},
        ]
    },
    {
        "title": "买卖股票的最佳时机",
        "slug": "best-time-to-buy-and-sell-stock",
        "difficulty": "Easy",
        "category": "数组",
        "description": """## 买卖股票的最佳时机

给定一个数组 `prices`，它的第 `i` 个元素 `prices[i]` 表示一支给定股票第 `i` 天的价格。

你只能选择某一天买入这只股票，并选择在未来的某一个不同的日子卖出该股票。设计一个算法来计算你所能获取的最大利润。

返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 `0`。

### 示例

```
输入：prices = [7,1,5,3,6,4]
输出：5
解释：在第 2 天（价格 = 1）买入，在第 5 天（价格 = 6）卖出，利润 = 6-1 = 5
```

```
输入：prices = [7,6,4,3,1]
输出：0
解释：在这种情况下, 没有交易完成, 所以最大利润为 0
```""",
        "starter_code": "def max_profit(prices):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            # 基础用例
            {"input": "prices = [7,1,5,3,6,4]\nprint(max_profit(prices))", "expected": "5"},
            {"input": "prices = [7,6,4,3,1]\nprint(max_profit(prices))", "expected": "0"},
            {"input": "prices = [2,4,1]\nprint(max_profit(prices))", "expected": "2"},
            # 常规用例
            {"input": "prices = [3,2,6,5,0,3]\nprint(max_profit(prices))", "expected": "4"},
            {"input": "prices = [1,2,3,4,5]\nprint(max_profit(prices))", "expected": "4"},
            {"input": "prices = [2,1,4]\nprint(max_profit(prices))", "expected": "3"},
            {"input": "prices = [1,4,2,7]\nprint(max_profit(prices))", "expected": "6"},
            {"input": "prices = [10,8,2,9]\nprint(max_profit(prices))", "expected": "7"},
            # 边界用例 - 单元素
            {"input": "prices = [5]\nprint(max_profit(prices))", "expected": "0"},
            # 两个元素
            {"input": "prices = [1,2]\nprint(max_profit(prices))", "expected": "1"},
            {"input": "prices = [2,1]\nprint(max_profit(prices))", "expected": "0"},
            # 全相同
            {"input": "prices = [3,3,3,3,3]\nprint(max_profit(prices))", "expected": "0"},
            # 严格递增
            {"input": "prices = [1,2,3,4,5,6,7,8,9,10]\nprint(max_profit(prices))", "expected": "9"},
            # 严格递减
            {"input": "prices = [10,9,8,7,6,5,4,3,2,1]\nprint(max_profit(prices))", "expected": "0"},
            # V 形
            {"input": "prices = [10,5,1,5,10]\nprint(max_profit(prices))", "expected": "9"},
            # 倒 V 形
            {"input": "prices = [1,5,10,5,1]\nprint(max_profit(prices))", "expected": "9"},
            # 波浪形
            {"input": "prices = [1,3,2,5,4,7]\nprint(max_profit(prices))", "expected": "6"},
            # 最大利润在后半段
            {"input": "prices = [8,6,4,3,1,9]\nprint(max_profit(prices))", "expected": "8"},
            # 大数值
            {"input": "prices = [10000,1,10000]\nprint(max_profit(prices))", "expected": "9999"},
            # 最低点在中间
            {"input": "prices = [5,3,1,3,5,7]\nprint(max_profit(prices))", "expected": "6"},
        ]
    },
    {
        "title": "有效回文串",
        "slug": "valid-palindrome",
        "difficulty": "Easy",
        "category": "字符串",
        "description": """## 有效回文串

如果在将所有大写字符转换为小写字符、并移除所有非字母数字字符之后，短语正着读和反着读都一样，则可以认为该短语是一个回文串。

字母和数字都属于字母数字字符。

给你一个字符串 `s`，如果它是回文串，返回 `True`；否则，返回 `False`。

### 示例

```
输入：s = "A man, a plan, a canal: Panama"
输出：True
解释："amanaplanacanalpanama" 是回文串
```

```
输入：s = "race a car"
输出：False
```""",
        "starter_code": "def is_palindrome(s):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            # 基础用例
            {"input": "s = \"A man, a plan, a canal: Panama\"\nprint(is_palindrome(s))", "expected": "True"},
            {"input": "s = \"race a car\"\nprint(is_palindrome(s))", "expected": "False"},
            {"input": "s = \" \"\nprint(is_palindrome(s))", "expected": "True"},
            # 常规用例
            {"input": "s = \"aba\"\nprint(is_palindrome(s))", "expected": "True"},
            {"input": "s = \"abba\"\nprint(is_palindrome(s))", "expected": "True"},
            {"input": "s = \"abc\"\nprint(is_palindrome(s))", "expected": "False"},
            {"input": "s = \"Was it a car or a cat I saw?\"\nprint(is_palindrome(s))", "expected": "True"},
            # 边界用例 - 空串
            {"input": "s = \"\"\nprint(is_palindrome(s))", "expected": "True"},
            # 单字符
            {"input": "s = \"a\"\nprint(is_palindrome(s))", "expected": "True"},
            {"input": "s = \"Z\"\nprint(is_palindrome(s))", "expected": "True"},
            # 全空格/标点
            {"input": "s = \"   \"\nprint(is_palindrome(s))", "expected": "True"},
            {"input": "s = \",.!?;:\"\nprint(is_palindrome(s))", "expected": "True"},
            # 纯数字
            {"input": "s = \"12321\"\nprint(is_palindrome(s))", "expected": "True"},
            {"input": "s = \"12345\"\nprint(is_palindrome(s))", "expected": "False"},
            # 大小写混合
            {"input": "s = \"Aa\"\nprint(is_palindrome(s))", "expected": "True"},
            {"input": "s = \"AbBa\"\nprint(is_palindrome(s))", "expected": "True"},
            # 数字和字母混合
            {"input": "s = \"a1b2b1a\"\nprint(is_palindrome(s))", "expected": "True"},
            {"input": "s = \"0P\"\nprint(is_palindrome(s))", "expected": "False"},
            # 特殊字符
            {"input": "s = \"@#$%^&\"\nprint(is_palindrome(s))", "expected": "True"},
            # 陷阱 - 只有一个字母数字字符
            {"input": "s = \"..a..\"\nprint(is_palindrome(s))", "expected": "True"},
            # 两字符不同
            {"input": "s = \"ab\"\nprint(is_palindrome(s))", "expected": "False"},
        ]
    },
    {
        "title": "无重复字符的最长子串",
        "slug": "longest-substring-without-repeating",
        "difficulty": "Medium",
        "category": "字符串",
        "description": """## 无重复字符的最长子串

给定一个字符串 `s`，请你找出其中不含有重复字符的最长子串的长度。

### 示例

```
输入：s = "abcabcbb"
输出：3
解释：因为无重复字符的最长子串是 "abc"，所以其长度为 3
```

```
输入：s = "bbbbb"
输出：1
解释：因为无重复字符的最长子串是 "b"，所以其长度为 1
```

```
输入：s = "pwwkew"
输出：3
解释：因为无重复字符的最长子串是 "wke"，所以其长度为 3
```""",
        "starter_code": "def length_of_longest_substring(s):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            # 基础用例
            {"input": "s = \"abcabcbb\"\nprint(length_of_longest_substring(s))", "expected": "3"},
            {"input": "s = \"bbbbb\"\nprint(length_of_longest_substring(s))", "expected": "1"},
            {"input": "s = \"pwwkew\"\nprint(length_of_longest_substring(s))", "expected": "3"},
            # 常规用例
            {"input": "s = \"abcdef\"\nprint(length_of_longest_substring(s))", "expected": "6"},
            {"input": "s = \"aab\"\nprint(length_of_longest_substring(s))", "expected": "2"},
            {"input": "s = \"dvdf\"\nprint(length_of_longest_substring(s))", "expected": "3"},
            {"input": "s = \"anviaj\"\nprint(length_of_longest_substring(s))", "expected": "5"},
            {"input": "s = \"abcbde\"\nprint(length_of_longest_substring(s))", "expected": "4"},
            # 边界用例 - 空串
            {"input": "s = \"\"\nprint(length_of_longest_substring(s))", "expected": "0"},
            # 单字符
            {"input": "s = \"a\"\nprint(length_of_longest_substring(s))", "expected": "1"},
            # 两个相同字符
            {"input": "s = \"aa\"\nprint(length_of_longest_substring(s))", "expected": "1"},
            # 两个不同字符
            {"input": "s = \"ab\"\nprint(length_of_longest_substring(s))", "expected": "2"},
            # 全不同
            {"input": "s = \"abcdefghij\"\nprint(length_of_longest_substring(s))", "expected": "10"},
            # 首尾重复
            {"input": "s = \"abcda\"\nprint(length_of_longest_substring(s))", "expected": "4"},
            # 重复在中间
            {"input": "s = \"abcbdef\"\nprint(length_of_longest_substring(s))", "expected": "5"},
            # 含空格
            {"input": "s = \"a b c a\"\nprint(length_of_longest_substring(s))", "expected": "4"},
            # 含数字
            {"input": "s = \"abc123abc\"\nprint(length_of_longest_substring(s))", "expected": "6"},
            # 极端 - 交替重复
            {"input": "s = \"ababababab\"\nprint(length_of_longest_substring(s))", "expected": "2"},
            # 最长子串在末尾
            {"input": "s = \"aabcdef\"\nprint(length_of_longest_substring(s))", "expected": "6"},
            # 最长子串在开头
            {"input": "s = \"abcdeff\"\nprint(length_of_longest_substring(s))", "expected": "6"},
        ]
    },
    {
        "title": "反转链表",
        "slug": "reverse-linked-list",
        "difficulty": "Easy",
        "category": "链表",
        "description": """## 反转链表

给你单链表的头节点 `head`，请你反转链表，并返回反转后的链表。

链表节点定义：
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

### 示例

```
输入：head = [1,2,3,4,5]
输出：[5,4,3,2,1]
```

```
输入：head = [1,2]
输出：[2,1]
```

```
输入：head = []
输出：[]
```""",
        "starter_code": "def reverse_list(head):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef build_list(arr):\n    dummy = ListNode(0)\n    curr = dummy\n    for v in arr:\n        curr.next = ListNode(v)\n        curr = curr.next\n    return dummy.next\n\ndef list_to_arr(head):\n    arr = []\n    while head:\n        arr.append(head.val)\n        head = head.next\n    return arr\n",
        "test_cases": [
            # 基础用例
            {"input": "head = build_list([1,2,3,4,5])\nprint(list_to_arr(reverse_list(head)))", "expected": "[5, 4, 3, 2, 1]"},
            {"input": "head = build_list([1,2])\nprint(list_to_arr(reverse_list(head)))", "expected": "[2, 1]"},
            {"input": "head = build_list([])\nprint(list_to_arr(reverse_list(head)))", "expected": "[]"},
            # 常规用例
            {"input": "head = build_list([1,2,3])\nprint(list_to_arr(reverse_list(head)))", "expected": "[3, 2, 1]"},
            {"input": "head = build_list([10,20,30,40])\nprint(list_to_arr(reverse_list(head)))", "expected": "[40, 30, 20, 10]"},
            {"input": "head = build_list([5,4,3,2,1])\nprint(list_to_arr(reverse_list(head)))", "expected": "[1, 2, 3, 4, 5]"},
            {"input": "head = build_list([1,2,3,4,5,6,7,8])\nprint(list_to_arr(reverse_list(head)))", "expected": "[8, 7, 6, 5, 4, 3, 2, 1]"},
            # 边界用例 - 单节点
            {"input": "head = build_list([1])\nprint(list_to_arr(reverse_list(head)))", "expected": "[1]"},
            {"input": "head = build_list([0])\nprint(list_to_arr(reverse_list(head)))", "expected": "[0]"},
            # 含重复值
            {"input": "head = build_list([1,1,1,1])\nprint(list_to_arr(reverse_list(head)))", "expected": "[1, 1, 1, 1]"},
            {"input": "head = build_list([1,2,2,1])\nprint(list_to_arr(reverse_list(head)))", "expected": "[1, 2, 2, 1]"},
            {"input": "head = build_list([1,2,3,2,1])\nprint(list_to_arr(reverse_list(head)))", "expected": "[1, 2, 3, 2, 1]"},
            # 含负数
            {"input": "head = build_list([-1,-2,-3])\nprint(list_to_arr(reverse_list(head)))", "expected": "[-3, -2, -1]"},
            {"input": "head = build_list([-5,0,5])\nprint(list_to_arr(reverse_list(head)))", "expected": "[5, 0, -5]"},
            # 含零
            {"input": "head = build_list([0,0,0])\nprint(list_to_arr(reverse_list(head)))", "expected": "[0, 0, 0]"},
            # 递增序列
            {"input": "head = build_list([1,2,3,4,5,6,7,8,9,10])\nprint(list_to_arr(reverse_list(head)))", "expected": "[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]"},
            # 大数值
            {"input": "head = build_list([1000000, -1000000])\nprint(list_to_arr(reverse_list(head)))", "expected": "[-1000000, 1000000]"},
            # 两节点
            {"input": "head = build_list([100,200])\nprint(list_to_arr(reverse_list(head)))", "expected": "[200, 100]"},
            # 三节点全不同
            {"input": "head = build_list([7,3,9])\nprint(list_to_arr(reverse_list(head)))", "expected": "[9, 3, 7]"},
            # 六节点
            {"input": "head = build_list([1,3,5,7,9,11])\nprint(list_to_arr(reverse_list(head)))", "expected": "[11, 9, 7, 5, 3, 1]"},
        ]
    },
    {
        "title": "合并两个有序链表",
        "slug": "merge-two-sorted-lists",
        "difficulty": "Easy",
        "category": "链表",
        "description": """## 合并两个有序链表

将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

### 示例

```
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```

```
输入：l1 = [], l2 = []
输出：[]
```

```
输入：l1 = [], l2 = [0]
输出：[0]
```""",
        "starter_code": "def merge_two_lists(l1, l2):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef build_list(arr):\n    dummy = ListNode(0)\n    curr = dummy\n    for v in arr:\n        curr.next = ListNode(v)\n        curr = curr.next\n    return dummy.next\n\ndef list_to_arr(head):\n    arr = []\n    while head:\n        arr.append(head.val)\n        head = head.next\n    return arr\n",
        "test_cases": [
            # 基础用例
            {"input": "l1 = build_list([1,2,4])\nl2 = build_list([1,3,4])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 1, 2, 3, 4, 4]"},
            {"input": "l1 = build_list([])\nl2 = build_list([])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[]"},
            {"input": "l1 = build_list([])\nl2 = build_list([0])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[0]"},
            # 常规用例
            {"input": "l1 = build_list([1,3,5])\nl2 = build_list([2,4,6])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2, 3, 4, 5, 6]"},
            {"input": "l1 = build_list([1,2,3])\nl2 = build_list([4,5,6])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2, 3, 4, 5, 6]"},
            {"input": "l1 = build_list([4,5,6])\nl2 = build_list([1,2,3])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2, 3, 4, 5, 6]"},
            {"input": "l1 = build_list([1,5,10])\nl2 = build_list([2,3,7,8])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2, 3, 5, 7, 8, 10]"},
            # 边界 - 一空一非空
            {"input": "l1 = build_list([1,2,3])\nl2 = build_list([])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2, 3]"},
            {"input": "l1 = build_list([])\nl2 = build_list([1,2,3])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2, 3]"},
            # 单元素
            {"input": "l1 = build_list([1])\nl2 = build_list([2])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2]"},
            {"input": "l1 = build_list([2])\nl2 = build_list([1])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2]"},
            # 含重复值
            {"input": "l1 = build_list([1,1,1])\nl2 = build_list([1,1,1])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 1, 1, 1, 1, 1]"},
            {"input": "l1 = build_list([2,2,3])\nl2 = build_list([2,3,3])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[2, 2, 2, 3, 3, 3]"},
            # 不等长
            {"input": "l1 = build_list([1])\nl2 = build_list([2,3,4,5,6])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2, 3, 4, 5, 6]"},
            {"input": "l1 = build_list([1,2,3,4,5])\nl2 = build_list([6])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2, 3, 4, 5, 6]"},
            # 含负数
            {"input": "l1 = build_list([-3,-1,0])\nl2 = build_list([-2,1,2])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[-3, -2, -1, 0, 1, 2]"},
            # 完全交叉
            {"input": "l1 = build_list([1,3,5,7])\nl2 = build_list([2,4,6,8])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[1, 2, 3, 4, 5, 6, 7, 8]"},
            # 相同值
            {"input": "l1 = build_list([5])\nl2 = build_list([5])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[5, 5]"},
            # 大数值
            {"input": "l1 = build_list([100,200,300])\nl2 = build_list([150,250,350])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[100, 150, 200, 250, 300, 350]"},
            # 含零
            {"input": "l1 = build_list([0,0,0])\nl2 = build_list([0,0])\nprint(list_to_arr(merge_two_lists(l1, l2)))", "expected": "[0, 0, 0, 0, 0]"},
        ]
    },
    {
        "title": "二叉树的最大深度",
        "slug": "maximum-depth-of-binary-tree",
        "difficulty": "Easy",
        "category": "树",
        "description": """## 二叉树的最大深度

给定一个二叉树 `root`，返回其最大深度。

二叉树的最大深度是指从根节点到最远叶子节点的最长路径上的节点数。

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

### 示例

```
输入：root = [3,9,20,null,null,15,7]
输出：3
```

```
输入：root = [1,null,2]
输出：2
```""",
        "starter_code": "def max_depth(root):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef build_tree(vals):\n    if not vals:\n        return None\n    root = TreeNode(vals[0])\n    queue = [root]\n    i = 1\n    while queue and i < len(vals):\n        node = queue.pop(0)\n        if i < len(vals) and vals[i] is not None:\n            node.left = TreeNode(vals[i])\n            queue.append(node.left)\n        i += 1\n        if i < len(vals) and vals[i] is not None:\n            node.right = TreeNode(vals[i])\n            queue.append(node.right)\n        i += 1\n    return root\n",
        "test_cases": [
            # 基础用例
            {"input": "root = build_tree([3,9,20,None,None,15,7])\nprint(max_depth(root))", "expected": "3"},
            {"input": "root = build_tree([1,None,2])\nprint(max_depth(root))", "expected": "2"},
            {"input": "root = build_tree([])\nprint(max_depth(root))", "expected": "0"},
            # 常规用例
            {"input": "root = build_tree([1,2,3,4,5])\nprint(max_depth(root))", "expected": "3"},
            {"input": "root = build_tree([1,2,3,4,5,6,7])\nprint(max_depth(root))", "expected": "3"},
            {"input": "root = build_tree([1,2,3,None,None,None,4])\nprint(max_depth(root))", "expected": "3"},
            # 边界 - 单节点
            {"input": "root = build_tree([1])\nprint(max_depth(root))", "expected": "1"},
            {"input": "root = build_tree([0])\nprint(max_depth(root))", "expected": "1"},
            # 只有左子树（倾斜树）
            {"input": "root = build_tree([1,2,None,3,None,4])\nprint(max_depth(root))", "expected": "4"},
            {"input": "root = build_tree([1,2,None,3])\nprint(max_depth(root))", "expected": "3"},
            # 只有右子树（倾斜树）
            {"input": "root = build_tree([1,None,2,None,3,None,4])\nprint(max_depth(root))", "expected": "4"},
            {"input": "root = build_tree([1,None,2,None,3])\nprint(max_depth(root))", "expected": "3"},
            # 完全二叉树
            {"input": "root = build_tree([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15])\nprint(max_depth(root))", "expected": "4"},
            # 不对称树
            {"input": "root = build_tree([1,2,3,4,None,None,None,5])\nprint(max_depth(root))", "expected": "4"},
            # 左深右浅
            {"input": "root = build_tree([1,2,3,4,None,None,None])\nprint(max_depth(root))", "expected": "3"},
            # 两层树
            {"input": "root = build_tree([1,2,3])\nprint(max_depth(root))", "expected": "2"},
            # 只有左子节点
            {"input": "root = build_tree([1,2])\nprint(max_depth(root))", "expected": "2"},
            # 只有右子节点
            {"input": "root = build_tree([1,None,3])\nprint(max_depth(root))", "expected": "2"},
            # 含负数值
            {"input": "root = build_tree([-1,-2,-3])\nprint(max_depth(root))", "expected": "2"},
            # 较深的树
            {"input": "root = build_tree([1,2,None,3,None,4,None,5])\nprint(max_depth(root))", "expected": "5"},
        ]
    },
    {
        "title": "翻转二叉树",
        "slug": "invert-binary-tree",
        "difficulty": "Easy",
        "category": "树",
        "description": """## 翻转二叉树

给你一棵二叉树的根节点 `root`，翻转这棵二叉树，并返回其根节点。

### 示例

```
输入：root = [4,2,7,1,3,6,9]
输出：[4,7,2,9,6,3,1]
```

```
输入：root = [2,1,3]
输出：[2,3,1]
```""",
        "starter_code": "def invert_tree(root):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef build_tree(vals):\n    if not vals:\n        return None\n    root = TreeNode(vals[0])\n    queue = [root]\n    i = 1\n    while queue and i < len(vals):\n        node = queue.pop(0)\n        if i < len(vals) and vals[i] is not None:\n            node.left = TreeNode(vals[i])\n            queue.append(node.left)\n        i += 1\n        if i < len(vals) and vals[i] is not None:\n            node.right = TreeNode(vals[i])\n            queue.append(node.right)\n        i += 1\n    return root\n\ndef tree_to_list(root):\n    if not root:\n        return []\n    result = []\n    queue = [root]\n    while queue:\n        node = queue.pop(0)\n        if node:\n            result.append(node.val)\n            queue.append(node.left)\n            queue.append(node.right)\n        else:\n            result.append(None)\n    while result and result[-1] is None:\n        result.pop()\n    return result\n",
        "test_cases": [
            # 基础用例
            {"input": "root = build_tree([4,2,7,1,3,6,9])\nprint(tree_to_list(invert_tree(root)))", "expected": "[4, 7, 2, 9, 6, 3, 1]"},
            {"input": "root = build_tree([2,1,3])\nprint(tree_to_list(invert_tree(root)))", "expected": "[2, 3, 1]"},
            {"input": "root = build_tree([])\nprint(tree_to_list(invert_tree(root)))", "expected": "[]"},
            # 常规用例
            {"input": "root = build_tree([1,2,3,4,5,6,7])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1, 3, 2, 7, 6, 5, 4]"},
            {"input": "root = build_tree([5,3,8,1,4,7,9])\nprint(tree_to_list(invert_tree(root)))", "expected": "[5, 8, 3, 9, 7, 4, 1]"},
            {"input": "root = build_tree([10,5,15,3,7])\nprint(tree_to_list(invert_tree(root)))", "expected": "[10, 15, 5, None, None, 7, 3]"},
            # 边界 - 单节点
            {"input": "root = build_tree([1])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1]"},
            {"input": "root = build_tree([0])\nprint(tree_to_list(invert_tree(root)))", "expected": "[0]"},
            # 只有左子树
            {"input": "root = build_tree([1,2,None,3])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1, None, 2, None, 3]"},
            {"input": "root = build_tree([1,2])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1, None, 2]"},
            # 只有右子树
            {"input": "root = build_tree([1,None,2,None,3])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1, 2, None, 3]"},
            {"input": "root = build_tree([1,None,3])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1, 3]"},
            # 对称树（翻转后不变）
            {"input": "root = build_tree([1,2,2,3,4,4,3])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1, 2, 2, 3, 4, 4, 3]"},
            # 不对称树
            {"input": "root = build_tree([1,2,3,None,4])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1, 3, 2, None, None, 4]"},
            # 两层
            {"input": "root = build_tree([1,2,3])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1, 3, 2]"},
            # 含负数
            {"input": "root = build_tree([-1,-2,-3])\nprint(tree_to_list(invert_tree(root)))", "expected": "[-1, -3, -2]"},
            # 含零
            {"input": "root = build_tree([0,1,2])\nprint(tree_to_list(invert_tree(root)))", "expected": "[0, 2, 1]"},
            # 完全二叉树 4 层
            {"input": "root = build_tree([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1, 3, 2, 7, 6, 5, 4, 15, 14, 13, 12, 11, 10, 9, 8]"},
            # 只有一侧有子节点
            {"input": "root = build_tree([1,2,3,4])\nprint(tree_to_list(invert_tree(root)))", "expected": "[1, 3, 2, None, None, None, 4]"},
            # 翻转两次应恢复原样（间接验证正确性）
            {"input": "root = build_tree([3,1,5,None,2,4])\nprint(tree_to_list(invert_tree(root)))", "expected": "[3, 5, 1, None, 4, 2]"},
        ]
    },
    {
        "title": "爬楼梯",
        "slug": "climbing-stairs",
        "difficulty": "Easy",
        "category": "动态规划",
        "description": """## 爬楼梯

假设你正在爬楼梯。需要 `n` 阶你才能到达楼顶。

每次你可以爬 `1` 或 `2` 个台阶。你有多少种不同的方法可以爬到楼顶呢？

### 示例

```
输入：n = 2
输出：2
解释：有两种方法可以爬到楼顶。
1. 1 阶 + 1 阶
2. 2 阶
```

```
输入：n = 3
输出：3
解释：有三种方法可以爬到楼顶。
1. 1 阶 + 1 阶 + 1 阶
2. 1 阶 + 2 阶
3. 2 阶 + 1 阶
```""",
        "starter_code": "def climb_stairs(n):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            # 基础用例
            {"input": "n = 2\nprint(climb_stairs(n))", "expected": "2"},
            {"input": "n = 3\nprint(climb_stairs(n))", "expected": "3"},
            {"input": "n = 5\nprint(climb_stairs(n))", "expected": "8"},
            # 逐个验证小值
            {"input": "n = 1\nprint(climb_stairs(n))", "expected": "1"},
            {"input": "n = 4\nprint(climb_stairs(n))", "expected": "5"},
            {"input": "n = 6\nprint(climb_stairs(n))", "expected": "13"},
            {"input": "n = 7\nprint(climb_stairs(n))", "expected": "21"},
            {"input": "n = 8\nprint(climb_stairs(n))", "expected": "34"},
            {"input": "n = 9\nprint(climb_stairs(n))", "expected": "55"},
            {"input": "n = 10\nprint(climb_stairs(n))", "expected": "89"},
            # 中等值
            {"input": "n = 15\nprint(climb_stairs(n))", "expected": "987"},
            {"input": "n = 20\nprint(climb_stairs(n))", "expected": "10946"},
            {"input": "n = 25\nprint(climb_stairs(n))", "expected": "121393"},
            {"input": "n = 30\nprint(climb_stairs(n))", "expected": "1346269"},
            # 较大值
            {"input": "n = 35\nprint(climb_stairs(n))", "expected": "14930352"},
            {"input": "n = 40\nprint(climb_stairs(n))", "expected": "165580141"},
            {"input": "n = 45\nprint(climb_stairs(n))", "expected": "1836311903"},
            # 边界附近
            {"input": "n = 11\nprint(climb_stairs(n))", "expected": "144"},
            {"input": "n = 12\nprint(climb_stairs(n))", "expected": "233"},
            {"input": "n = 13\nprint(climb_stairs(n))", "expected": "377"},
        ]
    },
    {
        "title": "零钱兑换",
        "slug": "coin-change",
        "difficulty": "Medium",
        "category": "动态规划",
        "description": """## 零钱兑换

给你一个整数数组 `coins`，表示不同面额的硬币；以及一个整数 `amount`，表示总金额。

计算并返回可以凑成总金额所需的最少的硬币个数。如果没有任何一种硬币组合能组成总金额，返回 `-1`。

你可以认为每种硬币的数量是无限的。

### 示例

```
输入：coins = [1, 5, 11], amount = 11
输出：1
解释：11 = 11
```

```
输入：coins = [2], amount = 3
输出：-1
```

```
输入：coins = [1], amount = 0
输出：0
```""",
        "starter_code": "def coin_change(coins, amount):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            # 基础用例
            {"input": "coins = [1, 5, 11]\namount = 11\nprint(coin_change(coins, amount))", "expected": "1"},
            {"input": "coins = [2]\namount = 3\nprint(coin_change(coins, amount))", "expected": "-1"},
            {"input": "coins = [1]\namount = 0\nprint(coin_change(coins, amount))", "expected": "0"},
            # 常规用例
            {"input": "coins = [1, 2, 5]\namount = 11\nprint(coin_change(coins, amount))", "expected": "3"},
            {"input": "coins = [1, 5, 10, 25]\namount = 30\nprint(coin_change(coins, amount))", "expected": "2"},
            {"input": "coins = [1, 2, 5]\namount = 100\nprint(coin_change(coins, amount))", "expected": "20"},
            {"input": "coins = [2, 5, 10]\namount = 27\nprint(coin_change(coins, amount))", "expected": "4"},
            # 边界 - amount=0
            {"input": "coins = [1, 2, 5]\namount = 0\nprint(coin_change(coins, amount))", "expected": "0"},
            {"input": "coins = [5, 10]\namount = 0\nprint(coin_change(coins, amount))", "expected": "0"},
            # 无解情况
            {"input": "coins = [3]\namount = 2\nprint(coin_change(coins, amount))", "expected": "-1"},
            {"input": "coins = [5, 10]\namount = 3\nprint(coin_change(coins, amount))", "expected": "-1"},
            {"input": "coins = [2]\namount = 1\nprint(coin_change(coins, amount))", "expected": "-1"},
            # 单硬币
            {"input": "coins = [1]\namount = 1\nprint(coin_change(coins, amount))", "expected": "1"},
            {"input": "coins = [1]\namount = 10\nprint(coin_change(coins, amount))", "expected": "10"},
            {"input": "coins = [5]\namount = 15\nprint(coin_change(coins, amount))", "expected": "3"},
            # 贪心陷阱 - 不能直接用最大面额
            {"input": "coins = [1, 3, 4]\namount = 6\nprint(coin_change(coins, amount))", "expected": "2"},
            {"input": "coins = [1, 5, 11]\namount = 15\nprint(coin_change(coins, amount))", "expected": "3"},
            # 大金额
            {"input": "coins = [1, 5, 10]\namount = 50\nprint(coin_change(coins, amount))", "expected": "5"},
            # 恰好能用一种硬币
            {"input": "coins = [7]\namount = 21\nprint(coin_change(coins, amount))", "expected": "3"},
            # 多种硬币组合
            {"input": "coins = [3, 7]\namount = 12\nprint(coin_change(coins, amount))", "expected": "4"},
        ]
    },
    # ─── 第 11 题：反转字符串 ───
    {
        "title": "反转字符串",
        "slug": "reverse-string",
        "difficulty": "Easy",
        "category": "双指针",
        "description": """## 反转字符串

编写一个函数，**原地**反转输入的字符串数组 `s`。

不要给另外的数组分配额外的空间，你必须原地修改输入数组、使用 O(1) 的额外空间解决这一问题。

### 示例

```
输入：s = ["h","e","l","l","o"]
输出：["o","l","l","e","h"]
```

### 提示
- `1 <= s.length <= 10^5`
- 使用双指针，一前一后向中间靠拢""",
        "starter_code": "def reverse_string(s):\n    # 原地修改 s（不要 return）\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "s = ['h','e','l','l','o']\nreverse_string(s)\nprint(s)", "expected": "['o', 'l', 'l', 'e', 'h']"},
            {"input": "s = ['H','a','n','n','a','h']\nreverse_string(s)\nprint(s)", "expected": "['h', 'a', 'n', 'n', 'a', 'H']"},
            {"input": "s = ['a']\nreverse_string(s)\nprint(s)", "expected": "['a']"},
            {"input": "s = ['a','b']\nreverse_string(s)\nprint(s)", "expected": "['b', 'a']"},
            {"input": "s = ['1','2','3','4','5','6']\nreverse_string(s)\nprint(s)", "expected": "['6', '5', '4', '3', '2', '1']"},
            {"input": "s = list('abcdefg')\nreverse_string(s)\nprint(s)", "expected": "['g', 'f', 'e', 'd', 'c', 'b', 'a']"},
        ]
    },
    # ─── 第 12 题：罗马数字转整数 ───
    {
        "title": "罗马数字转整数",
        "slug": "roman-to-integer",
        "difficulty": "Easy",
        "category": "字符串",
        "description": """## 罗马数字转整数

罗马数字包含以下七种字符：`I, V, X, L, C, D, M`，分别表示 1, 5, 10, 50, 100, 500, 1000。

通常情况下，罗马数字中小的数字在大的数字的右边。但也存在 6 种特例：
- I 可以放在 V (5) 和 X (10) 的左边，表示 4 和 9
- X 可以放在 L (50) 和 C (100) 的左边，表示 40 和 90
- C 可以放在 D (500) 和 M (1000) 的左边，表示 400 和 900

给定一个罗马数字，将其转换成整数。

### 示例

```
输入：s = "III"      输出：3
输入：s = "IV"       输出：4
输入：s = "IX"       输出：9
输入：s = "LVIII"    输出：58  (L=50, V=5, III=3)
输入：s = "MCMXCIV"  输出：1994 (M=1000, CM=900, XC=90, IV=4)
```""",
        "starter_code": "def roman_to_int(s):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(roman_to_int('III'))", "expected": "3"},
            {"input": "print(roman_to_int('IV'))", "expected": "4"},
            {"input": "print(roman_to_int('IX'))", "expected": "9"},
            {"input": "print(roman_to_int('LVIII'))", "expected": "58"},
            {"input": "print(roman_to_int('MCMXCIV'))", "expected": "1994"},
            {"input": "print(roman_to_int('I'))", "expected": "1"},
            {"input": "print(roman_to_int('MMMCMXCIX'))", "expected": "3999"},
            {"input": "print(roman_to_int('XL'))", "expected": "40"},
            {"input": "print(roman_to_int('XC'))", "expected": "90"},
            {"input": "print(roman_to_int('CD'))", "expected": "400"},
            {"input": "print(roman_to_int('CM'))", "expected": "900"},
        ]
    },
    # ─── 第 13 题：多数元素 ───
    {
        "title": "多数元素",
        "slug": "majority-element",
        "difficulty": "Easy",
        "category": "数组",
        "description": """## 多数元素

给定一个大小为 `n` 的数组 `nums`，返回其中的**多数元素**。多数元素是指在数组中出现次数 **大于** `⌊n/2⌋` 的元素。

你可以假设给定的数组总是存在多数元素。

### 示例

```
输入：nums = [3,2,3]              输出：3
输入：nums = [2,2,1,1,1,2,2]      输出：2
```

### 进阶
尝试设计时间复杂度为 O(n)、空间复杂度为 O(1) 的算法（摩尔投票法）。""",
        "starter_code": "def majority_element(nums):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(majority_element([3,2,3]))", "expected": "3"},
            {"input": "print(majority_element([2,2,1,1,1,2,2]))", "expected": "2"},
            {"input": "print(majority_element([1]))", "expected": "1"},
            {"input": "print(majority_element([1,1,1,1,2,3,4]))", "expected": "1"},
            {"input": "print(majority_element([5,5,5,5,5]))", "expected": "5"},
            {"input": "print(majority_element([-1,-1,-1,2,3]))", "expected": "-1"},
            {"input": "print(majority_element([1000000,1000000,2]))", "expected": "1000000"},
        ]
    },
    # ─── 第 14 题：移动零 ───
    {
        "title": "移动零",
        "slug": "move-zeroes",
        "difficulty": "Easy",
        "category": "双指针",
        "description": """## 移动零

给定一个数组 `nums`，编写一个函数将所有 `0` 移动到数组的末尾，同时保持非零元素的相对顺序。

**请注意**：必须在不复制数组的情况下原地对数组进行操作。

### 示例

```
输入：nums = [0,1,0,3,12]
输出：[1,3,12,0,0]
```

```
输入：nums = [0]
输出：[0]
```""",
        "starter_code": "def move_zeroes(nums):\n    # 原地修改 nums（不要 return）\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "nums = [0,1,0,3,12]\nmove_zeroes(nums)\nprint(nums)", "expected": "[1, 3, 12, 0, 0]"},
            {"input": "nums = [0]\nmove_zeroes(nums)\nprint(nums)", "expected": "[0]"},
            {"input": "nums = [1,2,3]\nmove_zeroes(nums)\nprint(nums)", "expected": "[1, 2, 3]"},
            {"input": "nums = [0,0,0,1]\nmove_zeroes(nums)\nprint(nums)", "expected": "[1, 0, 0, 0]"},
            {"input": "nums = [1,0,2,0,3]\nmove_zeroes(nums)\nprint(nums)", "expected": "[1, 2, 3, 0, 0]"},
            {"input": "nums = [0,0,0,0]\nmove_zeroes(nums)\nprint(nums)", "expected": "[0, 0, 0, 0]"},
            {"input": "nums = [4,2,4,0,0,3,0,5,1,0]\nmove_zeroes(nums)\nprint(nums)", "expected": "[4, 2, 4, 3, 5, 1, 0, 0, 0, 0]"},
        ]
    },
    # ─── 第 15 题：存在重复元素 ───
    {
        "title": "存在重复元素",
        "slug": "contains-duplicate",
        "difficulty": "Easy",
        "category": "哈希",
        "description": """## 存在重复元素

给你一个整数数组 `nums`。如果任一值在数组中出现 **至少两次** ，返回 `True`；如果数组中每个元素互不相同，返回 `False`。

### 示例

```
输入：nums = [1,2,3,1]        输出：True
输入：nums = [1,2,3,4]        输出：False
输入：nums = [1,1,1,3,3,4,3,2,4,2]  输出：True
```""",
        "starter_code": "def contains_duplicate(nums):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(contains_duplicate([1,2,3,1]))", "expected": "True"},
            {"input": "print(contains_duplicate([1,2,3,4]))", "expected": "False"},
            {"input": "print(contains_duplicate([1,1,1,3,3,4,3,2,4,2]))", "expected": "True"},
            {"input": "print(contains_duplicate([]))", "expected": "False"},
            {"input": "print(contains_duplicate([1]))", "expected": "False"},
            {"input": "print(contains_duplicate([-1,-1]))", "expected": "True"},
            {"input": "print(contains_duplicate([0,0,0,0,0]))", "expected": "True"},
        ]
    },
    # ─── 第 16 题：链表的中间节点 ───
    {
        "title": "链表的中间节点",
        "slug": "middle-of-linked-list",
        "difficulty": "Easy",
        "category": "链表",
        "description": """## 链表的中间节点

给你单链表的头结点 `head`，返回链表的**中间结点**。如果有两个中间结点，则返回**第二个**中间结点。

### 示例

```
输入：head = [1,2,3,4,5]
输出：3
解释：链表中间节点的值为 3
```

```
输入：head = [1,2,3,4,5,6]
输出：4
解释：链表有两个中间节点 3 和 4，返回第二个节点 4
```

### 提示
- 使用快慢双指针，快指针每次走 2 步，慢指针走 1 步""",
        "starter_code": """class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt

def build_list(arr):
    \"\"\"测试用：把数组转成链表，返回头节点\"\"\"
    if not arr: return None
    head = ListNode(arr[0])
    cur = head
    for v in arr[1:]:
        cur.next = ListNode(v)
        cur = cur.next
    return head

def middle_node(head):
    # 在这里写你的代码，返回中间节点
    pass
""",
        "helper_code": "",
        "test_cases": [
            {"input": "h = build_list([1,2,3,4,5])\nprint(middle_node(h).val)", "expected": "3"},
            {"input": "h = build_list([1,2,3,4,5,6])\nprint(middle_node(h).val)", "expected": "4"},
            {"input": "h = build_list([1])\nprint(middle_node(h).val)", "expected": "1"},
            {"input": "h = build_list([1,2])\nprint(middle_node(h).val)", "expected": "2"},
            {"input": "h = build_list([1,2,3])\nprint(middle_node(h).val)", "expected": "2"},
            {"input": "h = build_list([10,20,30,40,50,60,70])\nprint(middle_node(h).val)", "expected": "40"},
        ]
    },
    # ─── 第 17 题：环形链表 ───
    {
        "title": "环形链表",
        "slug": "linked-list-cycle",
        "difficulty": "Easy",
        "category": "链表",
        "description": """## 环形链表

给你一个链表的头节点 `head`，判断链表中是否有环。

如果链表中存在某个节点，可以通过连续跟踪 `next` 指针再次到达该节点，则链表中存在环。

如果链表中存在环，则返回 `True`。否则，返回 `False`。

### 示例

```
输入：head = [3,2,0,-4]，尾节点连到下标 1
输出：True
```

```
输入：head = [1,2]，无环
输出：False
```

### 提示
经典 Floyd 判圈算法：快慢双指针，如果有环必然相遇""",
        "starter_code": """class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt

def build_with_cycle(arr, pos):
    \"\"\"测试用：构造带环链表，pos=-1 表示无环\"\"\"
    if not arr: return None
    nodes = [ListNode(v) for v in arr]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i+1]
    if pos >= 0:
        nodes[-1].next = nodes[pos]
    return nodes[0]

def has_cycle(head):
    # 在这里写你的代码
    pass
""",
        "helper_code": "",
        "test_cases": [
            {"input": "print(has_cycle(build_with_cycle([3,2,0,-4], 1)))", "expected": "True"},
            {"input": "print(has_cycle(build_with_cycle([1,2], 0)))", "expected": "True"},
            {"input": "print(has_cycle(build_with_cycle([1], -1)))", "expected": "False"},
            {"input": "print(has_cycle(build_with_cycle([1,2,3,4,5], -1)))", "expected": "False"},
            {"input": "print(has_cycle(build_with_cycle([], -1)))", "expected": "False"},
            {"input": "print(has_cycle(build_with_cycle([1,2,3], 2)))", "expected": "True"},
        ]
    },
    # ─── 第 18 题：对称二叉树 ───
    {
        "title": "对称二叉树",
        "slug": "symmetric-tree",
        "difficulty": "Easy",
        "category": "树",
        "description": """## 对称二叉树

给你一个二叉树的根节点 `root`，检查它是否轴对称。

### 示例

```
输入：root = [1,2,2,3,4,4,3]
输出：True
       1
      / \\
     2   2
    / \\ / \\
   3  4 4  3
```

```
输入：root = [1,2,2,null,3,null,3]
输出：False
```""",
        "starter_code": """class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(arr):
    \"\"\"测试用：从层次遍历数组构造二叉树，None 代表空\"\"\"
    if not arr: return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        node = queue.pop(0)
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def is_symmetric(root):
    # 在这里写你的代码
    pass
""",
        "helper_code": "",
        "test_cases": [
            {"input": "print(is_symmetric(build_tree([1,2,2,3,4,4,3])))", "expected": "True"},
            {"input": "print(is_symmetric(build_tree([1,2,2,None,3,None,3])))", "expected": "False"},
            {"input": "print(is_symmetric(build_tree([1])))", "expected": "True"},
            {"input": "print(is_symmetric(build_tree([])))", "expected": "True"},
            {"input": "print(is_symmetric(build_tree([1,2,3])))", "expected": "False"},
            {"input": "print(is_symmetric(build_tree([1,2,2])))", "expected": "True"},
        ]
    },
    # ─── 第 19 题：相同的树 ───
    {
        "title": "相同的树",
        "slug": "same-tree",
        "difficulty": "Easy",
        "category": "树",
        "description": """## 相同的树

给你两棵二叉树的根节点 `p` 和 `q`，编写一个函数来检验这两棵树是否相同。

如果两个树在**结构上**相同，并且节点具有**相同的值**，则认为它们是相同的。

### 示例

```
输入：p = [1,2,3], q = [1,2,3]    输出：True
输入：p = [1,2], q = [1,null,2]   输出：False
输入：p = [1,2,1], q = [1,1,2]    输出：False
```""",
        "starter_code": """class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(arr):
    if not arr: return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        node = queue.pop(0)
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def is_same_tree(p, q):
    # 在这里写你的代码
    pass
""",
        "helper_code": "",
        "test_cases": [
            {"input": "print(is_same_tree(build_tree([1,2,3]), build_tree([1,2,3])))", "expected": "True"},
            {"input": "print(is_same_tree(build_tree([1,2]), build_tree([1,None,2])))", "expected": "False"},
            {"input": "print(is_same_tree(build_tree([1,2,1]), build_tree([1,1,2])))", "expected": "False"},
            {"input": "print(is_same_tree(build_tree([]), build_tree([])))", "expected": "True"},
            {"input": "print(is_same_tree(build_tree([1]), build_tree([])))", "expected": "False"},
            {"input": "print(is_same_tree(build_tree([1,2,3,4,5]), build_tree([1,2,3,4,5])))", "expected": "True"},
        ]
    },
    # ─── 第 20 题：第一个错误的版本 ───
    {
        "title": "第一个错误的版本",
        "slug": "first-bad-version",
        "difficulty": "Easy",
        "category": "二分查找",
        "description": """## 第一个错误的版本

你是产品经理，目前正在带领一个团队开发新产品。不幸的是，你的产品的最新版本没有通过质量检测。由于每个版本都是基于之前的版本开发的，所以错误版本之后的所有版本都是错的。

假设你有 `n` 个版本 `[1, 2, ..., n]`，请找出导致之后所有版本出错的第一个错误的版本。

你可以通过调用 `is_bad_version(version)` 接口来判断版本号 `version` 是否在单元测试中出错。实现一个函数来查找第一个错误的版本。**应该尽量减少对该接口的调用次数。**

### 示例

```
输入：n = 5, bad = 4
输出：4
解释：
调用 is_bad_version(3) -> False
调用 is_bad_version(5) -> True
调用 is_bad_version(4) -> True
所以，4 是第一个错误的版本
```

### 提示
经典二分查找题。`n` 可能很大，所以线性扫描会超时。""",
        "starter_code": """# 注意：FIRST_BAD 由测试用例设置，is_bad_version 已经定义好
FIRST_BAD = 1
def is_bad_version(version):
    return version >= FIRST_BAD

def first_bad_version(n):
    # 在这里写你的代码（用二分查找）
    pass
""",
        "helper_code": "",
        "test_cases": [
            {"input": "FIRST_BAD = 4\nprint(first_bad_version(5))", "expected": "4"},
            {"input": "FIRST_BAD = 1\nprint(first_bad_version(1))", "expected": "1"},
            {"input": "FIRST_BAD = 100\nprint(first_bad_version(100))", "expected": "100"},
            {"input": "FIRST_BAD = 1\nprint(first_bad_version(10))", "expected": "1"},
            {"input": "FIRST_BAD = 50\nprint(first_bad_version(100))", "expected": "50"},
            {"input": "FIRST_BAD = 9999\nprint(first_bad_version(10000))", "expected": "9999"},
        ]
    },
    # ─── 第 21 题：二分查找 (Medium) ───
    {
        "title": "二分查找",
        "slug": "binary-search",
        "difficulty": "Medium",
        "category": "二分查找",
        "description": """## 二分查找

给定一个 **n 个元素有序的（升序）**整型数组 `nums` 和一个目标值 `target`，写一个函数搜索 `nums` 中的 `target`，如果目标值存在返回下标，否则返回 `-1`。

你必须编写一个具有 `O(log n)` 时间复杂度的算法。

### 示例

```
输入：nums = [-1,0,3,5,9,12], target = 9   输出：4
输入：nums = [-1,0,3,5,9,12], target = 2   输出：-1
```""",
        "starter_code": "def search(nums, target):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(search([-1,0,3,5,9,12], 9))", "expected": "4"},
            {"input": "print(search([-1,0,3,5,9,12], 2))", "expected": "-1"},
            {"input": "print(search([5], 5))", "expected": "0"},
            {"input": "print(search([5], 3))", "expected": "-1"},
            {"input": "print(search([], 5))", "expected": "-1"},
            {"input": "print(search([1,2,3,4,5,6,7,8,9,10], 1))", "expected": "0"},
            {"input": "print(search([1,2,3,4,5,6,7,8,9,10], 10))", "expected": "9"},
            {"input": "print(search([1,2,3,4,5,6,7,8,9,10], 11))", "expected": "-1"},
            {"input": "print(search([-100,-50,0,50,100], -50))", "expected": "1"},
        ]
    },
    # ─── 第 22 题：三数之和 ───
    {
        "title": "三数之和",
        "slug": "three-sum",
        "difficulty": "Medium",
        "category": "双指针",
        "description": """## 三数之和

给你一个整数数组 `nums`，判断是否存在三元组 `[nums[i], nums[j], nums[k]]` 满足 `i != j、i != k 且 j != k`，同时还满足 `nums[i] + nums[j] + nums[k] == 0`。

请你返回所有和为 `0` 且**不重复**的三元组。

**注意**：答案中**不可以包含重复**的三元组。返回结果按每个三元组内升序、三元组之间升序排列。

### 示例

```
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1, -1, 2], [-1, 0, 1]]
```

```
输入：nums = [0,1,1]
输出：[]
```

### 提示
先排序，然后固定一个元素，剩下两个用双指针。""",
        "starter_code": "def three_sum(nums):\n    # 返回所有去重后的三元组，三元组内升序、之间升序\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(three_sum([-1,0,1,2,-1,-4]))", "expected": "[[-1, -1, 2], [-1, 0, 1]]"},
            {"input": "print(three_sum([0,1,1]))", "expected": "[]"},
            {"input": "print(three_sum([0,0,0]))", "expected": "[[0, 0, 0]]"},
            {"input": "print(three_sum([]))", "expected": "[]"},
            {"input": "print(three_sum([1,2,-2,-1]))", "expected": "[]"},
            {"input": "print(three_sum([-2,0,1,1,2]))", "expected": "[[-2, 0, 2], [-2, 1, 1]]"},
            {"input": "print(three_sum([0,0,0,0]))", "expected": "[[0, 0, 0]]"},
        ]
    },
    # ─── 第 23 题：最大子数组和 ───
    {
        "title": "最大子数组和",
        "slug": "maximum-subarray",
        "difficulty": "Medium",
        "category": "动态规划",
        "description": """## 最大子数组和

给你一个整数数组 `nums`，请你找出一个具有**最大和**的连续子数组（子数组最少包含一个元素），返回其最大和。

**子数组**是数组中的一个连续部分。

### 示例

```
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6
```

```
输入：nums = [1]      输出：1
输入：nums = [5,4,-1,7,8]   输出：23
```

### 提示
经典 Kadane 算法：`dp[i] = max(dp[i-1] + nums[i], nums[i])`""",
        "starter_code": "def max_sub_array(nums):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(max_sub_array([-2,1,-3,4,-1,2,1,-5,4]))", "expected": "6"},
            {"input": "print(max_sub_array([1]))", "expected": "1"},
            {"input": "print(max_sub_array([5,4,-1,7,8]))", "expected": "23"},
            {"input": "print(max_sub_array([-1]))", "expected": "-1"},
            {"input": "print(max_sub_array([-2,-3,-1,-5]))", "expected": "-1"},
            {"input": "print(max_sub_array([1,2,3,4,5]))", "expected": "15"},
            {"input": "print(max_sub_array([0,0,0,0]))", "expected": "0"},
            {"input": "print(max_sub_array([-1,-2,3,-4,5,-6,7]))", "expected": "7"},
        ]
    },
    # ─── 第 24 题：跳跃游戏 ───
    {
        "title": "跳跃游戏",
        "slug": "jump-game",
        "difficulty": "Medium",
        "category": "贪心",
        "description": """## 跳跃游戏

给定一个非负整数数组 `nums`，你最初位于数组的**第一个下标**。

数组中的每个元素代表你在该位置可以**跳跃的最大长度**。

判断你是否能够到达最后一个下标，如果可以，返回 `True`；否则，返回 `False`。

### 示例

```
输入：nums = [2,3,1,1,4]   输出：True
解释：可以先跳 1 步，从下标 0 到达下标 1, 然后再从下标 1 跳 3 步到达最后一个下标
```

```
输入：nums = [3,2,1,0,4]   输出：False
解释：无论怎样，总会到达下标为 3 的位置。但该下标的最大跳跃长度是 0，所以你永远不可能到达最后一个下标
```

### 提示
贪心：维护"能到达的最远位置"。""",
        "starter_code": "def can_jump(nums):\n    # 在这里写你的代码\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(can_jump([2,3,1,1,4]))", "expected": "True"},
            {"input": "print(can_jump([3,2,1,0,4]))", "expected": "False"},
            {"input": "print(can_jump([0]))", "expected": "True"},
            {"input": "print(can_jump([1,0,1]))", "expected": "False"},
            {"input": "print(can_jump([5,0,0,0,0]))", "expected": "True"},
            {"input": "print(can_jump([1,1,1,1]))", "expected": "True"},
            {"input": "print(can_jump([2,0,0]))", "expected": "True"},
            {"input": "print(can_jump([0,1]))", "expected": "False"},
        ]
    },
    # ─── 第 25 题：搜索旋转排序数组 ───
    {
        "title": "搜索旋转排序数组",
        "slug": "search-rotated-sorted-array",
        "difficulty": "Medium",
        "category": "二分查找",
        "description": """## 搜索旋转排序数组

整数数组 `nums` 按升序排列，数组中的值**互不相同**。

在传递给函数之前，`nums` 在预先未知的某个下标 `k` 处经过了**旋转**，使数组变为 `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]`（下标从 0 开始计数）。

给你旋转后的数组 `nums` 和一个整数 `target`，如果 `nums` 中存在这个目标值 `target`，则返回它的下标，否则返回 `-1`。

你必须设计一个时间复杂度为 `O(log n)` 的算法解决此问题。

### 示例

```
输入：nums = [4,5,6,7,0,1,2], target = 0  输出：4
输入：nums = [4,5,6,7,0,1,2], target = 3  输出：-1
输入：nums = [1], target = 0              输出：-1
```""",
        "starter_code": "def search_rotated(nums, target):\n    # 在这里写你的代码（O(log n)）\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(search_rotated([4,5,6,7,0,1,2], 0))", "expected": "4"},
            {"input": "print(search_rotated([4,5,6,7,0,1,2], 3))", "expected": "-1"},
            {"input": "print(search_rotated([1], 0))", "expected": "-1"},
            {"input": "print(search_rotated([1], 1))", "expected": "0"},
            {"input": "print(search_rotated([1,2,3,4,5], 3))", "expected": "2"},
            {"input": "print(search_rotated([5,1,2,3,4], 1))", "expected": "1"},
            {"input": "print(search_rotated([3,4,5,1,2], 5))", "expected": "2"},
            {"input": "print(search_rotated([], 5))", "expected": "-1"},
        ]
    },
    # ─── 第 26 题：全排列 ───
    {
        "title": "全排列",
        "slug": "permutations",
        "difficulty": "Medium",
        "category": "回溯",
        "description": """## 全排列

给定一个**不含重复数字**的数组 `nums`，返回其 **所有可能的全排列**。你可以**按任意顺序**返回答案。

为了便于测试，请按字典序升序返回。

### 示例

```
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

```
输入：nums = [0,1]   输出：[[0,1],[1,0]]
输入：nums = [1]     输出：[[1]]
```""",
        "starter_code": "def permute(nums):\n    # 返回排序后的全排列\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(permute([1,2,3]))", "expected": "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]"},
            {"input": "print(permute([0,1]))", "expected": "[[0, 1], [1, 0]]"},
            {"input": "print(permute([1]))", "expected": "[[1]]"},
            {"input": "print(permute([1,2]))", "expected": "[[1, 2], [2, 1]]"},
            {"input": "print(len(permute([1,2,3,4])))", "expected": "24"},
            {"input": "print(permute([5,6,7]))", "expected": "[[5, 6, 7], [5, 7, 6], [6, 5, 7], [6, 7, 5], [7, 5, 6], [7, 6, 5]]"},
        ]
    },
    # ─── 第 27 题：子集 ───
    {
        "title": "子集",
        "slug": "subsets",
        "difficulty": "Medium",
        "category": "回溯",
        "description": """## 子集

给你一个整数数组 `nums`，数组中的元素**互不相同**。返回该数组所有可能的**子集**（幂集）。

解集**不能**包含重复的子集。你可以按**任意顺序**返回解集。

为便于测试，请按"长度升序、相同长度内字典序"排列返回。

### 示例

```
输入：nums = [1,2,3]
输出：[[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]
```""",
        "starter_code": "def subsets(nums):\n    # 返回排序后的所有子集\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(subsets([1,2,3]))", "expected": "[[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]"},
            {"input": "print(subsets([0]))", "expected": "[[], [0]]"},
            {"input": "print(subsets([]))", "expected": "[[]]"},
            {"input": "print(subsets([1,2]))", "expected": "[[], [1], [2], [1, 2]]"},
            {"input": "print(len(subsets([1,2,3,4])))", "expected": "16"},
            {"input": "print(len(subsets([1,2,3,4,5])))", "expected": "32"},
        ]
    },
    # ─── 第 28 题：岛屿数量 ───
    {
        "title": "岛屿数量",
        "slug": "number-of-islands",
        "difficulty": "Medium",
        "category": "图论",
        "description": """## 岛屿数量

给你一个由 `'1'`（陆地）和 `'0'`（水）组成的的二维网格，请你计算网格中**岛屿的数量**。

岛屿总是被水包围，并且每座岛屿只能由**水平方向和/或竖直方向**上相邻的陆地连接形成。

此外，你可以假设该网格的四条边均被水包围。

### 示例

```
输入：grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
输出：1
```

```
输入：grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
输出：3
```""",
        "starter_code": "def num_islands(grid):\n    # 在这里写你的代码（DFS / BFS / 并查集均可）\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(num_islands([['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]))", "expected": "1"},
            {"input": "print(num_islands([['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']]))", "expected": "3"},
            {"input": "print(num_islands([['0']]))", "expected": "0"},
            {"input": "print(num_islands([['1']]))", "expected": "1"},
            {"input": "print(num_islands([['1','0','1','0','1']]))", "expected": "3"},
            {"input": "print(num_islands([['1','1','1'],['1','1','1'],['1','1','1']]))", "expected": "1"},
            {"input": "print(num_islands([]))", "expected": "0"},
        ]
    },
    # ─── 第 29 题：最长回文子串 ───
    {
        "title": "最长回文子串",
        "slug": "longest-palindromic-substring",
        "difficulty": "Medium",
        "category": "字符串",
        "description": """## 最长回文子串

给你一个字符串 `s`，找到 `s` 中**最长的**回文子串。如果有多个相同长度的回文子串，返回**最先出现**的那个。

### 示例

```
输入：s = "babad"     输出："bab"  （"aba" 也是合法答案）
输入：s = "cbbd"      输出："bb"
```

### 提示
中心扩展法：枚举每个可能的"中心"（奇数长度以单字符为中心、偶数长度以两字符之间为中心），向两侧扩展。""",
        "starter_code": "def longest_palindrome(s):\n    # 返回 s 中最长的回文子串（多个等长返回最先出现的）\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(longest_palindrome('babad'))", "expected": "bab"},
            {"input": "print(longest_palindrome('cbbd'))", "expected": "bb"},
            {"input": "print(longest_palindrome('a'))", "expected": "a"},
            {"input": "print(longest_palindrome('ac'))", "expected": "a"},
            {"input": "print(longest_palindrome('aaaa'))", "expected": "aaaa"},
            {"input": "print(longest_palindrome('racecar'))", "expected": "racecar"},
            {"input": "print(longest_palindrome('abcdefg'))", "expected": "a"},
            {"input": "print(longest_palindrome('abacdfgdcaba'))", "expected": "aba"},
        ]
    },
    # ─── 第 30 题：课程表 (拓扑排序) ───
    {
        "title": "课程表",
        "slug": "course-schedule",
        "difficulty": "Medium",
        "category": "图论",
        "description": """## 课程表

你这个学期必须选修 `numCourses` 门课程，记为 `0` 到 `numCourses - 1`。

在选修某些课程之前需要一些**先修课程**。先修课程按数组 `prerequisites` 给出，其中 `prerequisites[i] = [ai, bi]`，表示如果要学习课程 `ai` 则**必须**先学习课程 `bi`。

请你判断是否可能完成所有课程的学习？如果可以，返回 `True`；否则，返回 `False`。

### 示例

```
输入：numCourses = 2, prerequisites = [[1,0]]
输出：True
解释：先学课程 0，然后再学课程 1，可行
```

```
输入：numCourses = 2, prerequisites = [[1,0],[0,1]]
输出：False
解释：循环依赖，无法完成
```

### 提示
本质是判断有向图是否有环（拓扑排序 / DFS 染色）。""",
        "starter_code": "def can_finish(num_courses, prerequisites):\n    # 在这里写你的代码（判断有向图是否有环）\n    pass\n",
        "helper_code": "",
        "test_cases": [
            {"input": "print(can_finish(2, [[1,0]]))", "expected": "True"},
            {"input": "print(can_finish(2, [[1,0],[0,1]]))", "expected": "False"},
            {"input": "print(can_finish(1, []))", "expected": "True"},
            {"input": "print(can_finish(5, [[1,0],[2,1],[3,2],[4,3]]))", "expected": "True"},
            {"input": "print(can_finish(3, [[0,1],[1,2],[2,0]]))", "expected": "False"},
            {"input": "print(can_finish(4, [[1,0],[2,0],[3,1],[3,2]]))", "expected": "True"},
            {"input": "print(can_finish(2, []))", "expected": "True"},
        ]
    }
]

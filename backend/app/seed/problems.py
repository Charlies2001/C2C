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
    }
]

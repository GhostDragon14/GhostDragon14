numerals ={"M": 1000, "CM": 900, "D": 500, "CD": 400, "C": 100, "XC": 90, "L": 50, "XL": 40, "X": 10, "IX": 9, "V": 5, "IV": 4, "I": 1}
def main():
    my_num = 901
    for i, (k,v) in enumerate(numerals.items()):
        mod_val = my_num % v
        numeral_count = (my_num - mod_val) / v
        my_num = my_num - (my_num - mod_val)
        print("{}".format(k)*int(numeral_count), end = "")
    return
if __name__ == '__main__':
    main()
